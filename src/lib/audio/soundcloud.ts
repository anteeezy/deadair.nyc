// ─────────────────────────────────────────────────────────────────────────
// SoundCloud Widget API controller.
//
// Streams an official SoundCloud set through a hidden iframe. We can't tap its
// audio for the visualizer (cross-origin), but it's legal (SoundCloud holds the
// license) and needs no hosting. Supports a wall-clock "live join" so tuning in
// drops you onto whatever track/position is live right now.
// ─────────────────────────────────────────────────────────────────────────

interface SCWidget {
	bind(event: string, fn: (e?: unknown) => void): void;
	load(url: string, opts: Record<string, unknown>): void;
	play(): void;
	pause(): void;
	seekTo(ms: number): void;
	setVolume(v: number): void;
	skip(index: number): void;
	getSounds(cb: (sounds: SCSound[]) => void): void;
	getCurrentSound(cb: (s: SCSound | null) => void): void;
	getCurrentSoundIndex(cb: (i: number) => void): void;
}
interface SCSound {
	title?: string;
	duration?: number; // ms
	user?: { username?: string };
}
interface SCStatic {
	Widget: ((el: HTMLIFrameElement) => SCWidget) & { Events: Record<string, string> };
}

export interface SCEvents {
	onTrack?: (title: string, artist: string) => void;
}

class SoundCloud {
	private widget: SCWidget | null = null;
	private SC: SCStatic | null = null;
	private ready = false;
	private wantPlay = false;
	private sounds: { duration: number; title: string; artist: string }[] = [];
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

	/** Called once by the hidden host component when its iframe mounts. */
	async attach(iframe: HTMLIFrameElement): Promise<void> {
		this.SC = await this.loadApi();
		const widget = this.SC.Widget(iframe);
		this.widget = widget;
		const E = this.SC.Widget.Events;

		widget.bind(E.READY, () => {
			this.ready = true;
			widget.getSounds((arr) => {
				this.sounds = (arr || []).map((s) => ({
					duration: s.duration || 0,
					title: s.title || '',
					artist: s.user?.username || ''
				}));
				if (this.wantPlay) {
					this.wantPlay = false;
					this.joinLive();
				}
			});
		});

		const announce = () =>
			widget.getCurrentSound((s) => {
				if (s) this.events.onTrack?.(s.title || '', s.user?.username || '');
			});
		widget.bind(E.PLAY, announce);
		widget.bind(E.PLAY_PROGRESS, announce);
		// loop the set: when the last track finishes, jump back to the top
		widget.bind(E.FINISH, () => {
			widget.getCurrentSoundIndex((i) => {
				if (i >= this.sounds.length - 1) widget.skip(0);
			});
		});
	}

	private liveSlot(): { index: number; offsetMs: number } {
		const total = this.sounds.reduce((a, s) => a + s.duration, 0);
		if (total <= 0) return { index: 0, offsetMs: 0 };
		let e = Date.now() % total;
		for (let i = 0; i < this.sounds.length; i++) {
			if (e < this.sounds[i].duration) return { index: i, offsetMs: e };
			e -= this.sounds[i].duration;
		}
		return { index: 0, offsetMs: 0 };
	}

	/** Join the set at the live wall-clock position. */
	joinLive(): void {
		if (!this.widget) {
			this.wantPlay = true;
			return;
		}
		if (!this.ready || !this.sounds.length) {
			this.wantPlay = true;
			return;
		}
		// SoundCloud lazy-loads set metadata, so durations past the first few
		// tracks may be 0. Only do the precise to-the-second join when we have
		// them all; otherwise rotate at the track level (still wall-clock
		// consistent across listeners, just not seeked).
		const allKnown = this.sounds.every((s) => s.duration > 0);
		if (allKnown) {
			const slot = this.liveSlot();
			this.widget.skip(slot.index);
			this.widget.play();
			if (slot.offsetMs > 1000) setTimeout(() => this.widget?.seekTo(slot.offsetMs), 700);
		} else {
			const AVG = 3.6 * 60 * 1000; // assume ~3.6-min tracks
			const idx = Math.floor((Date.now() / AVG) % this.sounds.length);
			this.widget.skip(idx);
			this.widget.play();
		}
	}

	play(): void {
		if (this.ready) this.widget?.play();
		else this.wantPlay = true;
	}
	pause(): void {
		this.wantPlay = false;
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
