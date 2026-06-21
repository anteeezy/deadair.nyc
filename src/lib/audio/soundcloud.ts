// ─────────────────────────────────────────────────────────────────────────
// SoundCloud Widget API — one hidden "deck" (iframe + widget) PER channel, so
// each keeps its own position. Switching channels just pauses one deck and
// resumes another (no reload → no restart). Volume is remembered and re-applied
// on every load (SoundCloud resets it otherwise).
//
// Channel shapes:
//   'list' — a hand-built playlist of track URLs (we queue them, advance, loop)
//   'set'  — a SoundCloud set URL (native set playback, loop on last)
//
// Legal (official uploads), no hosting. Cross-origin → no visualizer reactivity,
// and no second-accurate cross-listener sync (see notes in the app).
// ─────────────────────────────────────────────────────────────────────────

interface SCWidget {
	bind(event: string, fn: (e?: unknown) => void): void;
	load(url: string, opts: Record<string, unknown>): void;
	play(): void;
	pause(): void;
	setVolume(v: number): void;
	getCurrentSound(cb: (s: SCSound | null) => void): void;
	getCurrentSoundIndex(cb: (i: number) => void): void;
	getSounds(cb: (s: SCSound[]) => void): void;
}
interface SCSound {
	title?: string;
	user?: { username?: string };
}
interface SCStatic {
	Widget: ((el: HTMLIFrameElement) => SCWidget) & { Events: Record<string, string> };
}

export type SCSource = { type: 'list'; urls: string[] } | { type: 'set'; url: string };

export interface SCEvents {
	onTrack?: (title: string, artist: string) => void;
}

class Deck {
	private widget: SCWidget;
	private E: Record<string, string>;
	private ready = false;
	private pendingPlay = false;
	private source: SCSource;
	private idx: number;
	private vol = 0.8;
	private report: (title: string, artist: string) => void;

	constructor(
		SC: SCStatic,
		iframe: HTMLIFrameElement,
		source: SCSource,
		idx: number,
		report: (title: string, artist: string) => void
	) {
		this.source = source;
		this.idx = idx;
		this.report = report;
		this.E = SC.Widget.Events;
		const widget = SC.Widget(iframe);
		this.widget = widget;

		widget.bind(this.E.READY, () => {
			this.ready = true;
			widget.setVolume(Math.round(this.vol * 100));
			if (this.pendingPlay) {
				this.pendingPlay = false;
				widget.play();
			}
		});
		widget.bind(this.E.PLAY, () => this.announce());
		widget.bind(this.E.PLAY_PROGRESS, () => this.announce());
		widget.bind(this.E.FINISH, () => this.onFinish());
	}

	private announce(): void {
		this.widget.getCurrentSound((s) => {
			if (s) this.report(s.title || '', s.user?.username || '');
		});
	}

	private onFinish(): void {
		if (this.source.type === 'list') {
			this.idx = (this.idx + 1) % this.source.urls.length;
			this.loadPlay(this.source.urls[this.idx]);
		} else {
			const url = this.source.url;
			this.widget.getCurrentSoundIndex((i) =>
				this.widget.getSounds((arr) => {
					if (i >= arr.length - 1) this.loadPlay(url); // loop the set
				})
			);
		}
	}

	private loadPlay(url: string): void {
		this.widget.load(url, {
			auto_play: true,
			callback: () => {
				this.widget.setVolume(Math.round(this.vol * 100)); // keep the user's volume
				this.announce();
			}
		});
	}

	/** resume whatever this deck has loaded (in-gesture → autoplay-safe) */
	play(): void {
		if (!this.ready) {
			this.pendingPlay = true;
			return;
		}
		this.widget.setVolume(Math.round(this.vol * 100));
		this.widget.play();
	}

	pause(): void {
		this.pendingPlay = false;
		this.widget.pause();
	}

	setVolume(v: number): void {
		this.vol = Math.max(0, Math.min(1, v));
		this.widget.setVolume(Math.round(this.vol * 100));
	}
}

class SoundCloud {
	private SC: SCStatic | null = null;
	private decks = new Map<string, Deck>();
	private activeId: string | null = null;
	private pendingActive: string | null = null;
	private vol = 0.8;
	events: SCEvents = {};

	private loadApi(): Promise<SCStatic> {
		return new Promise((resolve) => {
			const w = window as unknown as { SC?: SCStatic };
			if (w.SC) return resolve(w.SC);
			const s = document.createElement('script');
			s.src = 'https://w.soundcloud.com/player/api.js';
			s.onload = () => resolve((window as unknown as { SC: SCStatic }).SC);
			document.head.appendChild(s);
		});
	}

	/** Host registers one deck per SoundCloud channel (iframe preloaded). */
	async register(channelId: string, iframe: HTMLIFrameElement, source: SCSource, idx: number): Promise<void> {
		const SC = await this.loadApi();
		const deck = new Deck(SC, iframe, source, idx, (t, a) => {
			if (this.activeId === channelId) this.events.onTrack?.(t, a);
		});
		deck.setVolume(this.vol);
		this.decks.set(channelId, deck);
		if (this.pendingActive === channelId) {
			this.pendingActive = null;
			this.tune(channelId);
		}
	}

	/** Tune to a channel — call synchronously inside the click. */
	tune(channelId: string): void {
		for (const [id, d] of this.decks) if (id !== channelId) d.pause();
		this.activeId = channelId;
		const deck = this.decks.get(channelId);
		if (!deck) {
			this.pendingActive = channelId;
			return;
		}
		deck.play();
	}

	pause(): void {
		if (this.activeId) this.decks.get(this.activeId)?.pause();
	}

	pauseAll(): void {
		this.pendingActive = null;
		for (const d of this.decks.values()) d.pause();
	}

	setVolume(v: number): void {
		this.vol = Math.max(0, Math.min(1, v));
		for (const d of this.decks.values()) d.setVolume(this.vol);
	}
}

export const sc = new SoundCloud();

if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as unknown as { __sc: SoundCloud }).__sc = sc;
}
