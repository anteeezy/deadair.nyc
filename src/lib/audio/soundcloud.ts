// ─────────────────────────────────────────────────────────────────────────
// SoundCloud Widget API controller — one hidden iframe, two channel shapes:
//   • 'list' — a hand-built playlist of individual track URLs (we queue them)
//   • 'set'  — a SoundCloud set/playlist URL (the widget queues it natively)
//
// Legal (official uploads), no hosting. Cross-origin → no visualizer reactivity.
//
// Autoplay note: SoundCloud only starts if play() fires *inside* the click. The
// iframe is preloaded with the default channel's first track so its first play
// is a synchronous resume. Once the page is "activated", switching channels via
// load(auto_play) is allowed.
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

class SoundCloud {
	private widget: SCWidget | null = null;
	private SC: SCStatic | null = null;
	private ready = false;
	private pending: SCSource | null = null;
	private loadedUrl = ''; // track url (list) or set url (set) currently in the widget
	private source: SCSource | null = null;
	private idx = 0; // position within a 'list' source
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

	/** Host calls this once. The iframe is preloaded with `source` at `idx`. */
	async attach(iframe: HTMLIFrameElement, source: SCSource, idx: number, loadedUrl: string): Promise<void> {
		this.source = source;
		this.idx = idx;
		this.loadedUrl = loadedUrl;
		this.SC = await this.loadApi();
		const widget = this.SC.Widget(iframe);
		this.widget = widget;
		const E = this.SC.Widget.Events;

		widget.bind(E.READY, () => {
			this.ready = true;
			if (this.pending) {
				const p = this.pending;
				this.pending = null;
				this.tune(p);
			}
		});
		widget.bind(E.PLAY, () => this.announce());
		widget.bind(E.PLAY_PROGRESS, () => this.announce());
		widget.bind(E.FINISH, () => this.onFinish());
	}

	private announce(): void {
		this.widget?.getCurrentSound((s) => {
			if (s) this.events.onTrack?.(s.title || '', s.user?.username || '');
		});
	}

	private loadPlay(url: string): void {
		this.loadedUrl = url;
		this.widget?.load(url, { auto_play: true, callback: () => this.announce() });
	}

	private onFinish(): void {
		if (!this.widget || !this.source) return;
		if (this.source.type === 'list') {
			this.idx = (this.idx + 1) % this.source.urls.length;
			this.loadPlay(this.source.urls[this.idx]);
		} else {
			// a set auto-advances internally; loop back when the last track ends
			const setUrl = this.source.url;
			this.widget.getCurrentSoundIndex((i) =>
				this.widget?.getSounds((arr) => {
					if (i >= arr.length - 1) this.loadPlay(setUrl);
				})
			);
		}
	}

	/** Tune to a SoundCloud source — call synchronously inside the click. */
	tune(source: SCSource): void {
		this.source = source;
		if (!this.widget || !this.ready) {
			this.pending = source;
			return;
		}
		let target: string;
		if (source.type === 'list') {
			if (this.idx >= source.urls.length) this.idx = 0;
			target = source.urls[this.idx];
		} else {
			target = source.url;
		}
		if (this.loadedUrl === target) this.widget.play(); // synchronous — autoplay-safe
		else this.loadPlay(target); // needs prior activation (default channel handles that)
	}

	pause(): void {
		this.pending = null;
		this.widget?.pause();
	}

	setVolume(v: number): void {
		this.widget?.setVolume(Math.round(Math.max(0, Math.min(1, v)) * 100));
	}
}

export const sc = new SoundCloud();

if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as unknown as { __sc: SoundCloud }).__sc = sc;
}
