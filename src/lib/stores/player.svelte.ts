// ─────────────────────────────────────────────────────────────────────────
// Player state (Svelte 5 runes) — a LIVE feed.
//
// Each channel plays a continuous program. You can't pick or scrub tracks;
// you tune between channels and join whatever is playing *right now*, at the
// position derived from wall-clock time (liveSlot). Now-playing follows the
// live song as the program auto-advances.
// ─────────────────────────────────────────────────────────────────────────

import { engine } from '$lib/audio/engine';
import { sc } from '$lib/audio/soundcloud';
import { channels, type Track, type Channel } from '$lib/data/tracks';

export type Status = 'off' | 'idle' | 'playing' | 'paused' | 'offair';

class Player {
	status = $state<Status>('off');
	channelIndex = $state(0);
	index = $state(0); // track within the current channel program
	time = $state(0);
	duration = $state(0);
	volume = $state(0.8);
	// now-playing reported by the SoundCloud widget (cross-origin, no <audio>)
	scTitle = $state('');
	scArtist = $state('');

	readonly channels = channels;

	constructor() {
		engine.events.time = (t, d) => {
			// static / soundcloud have no local timeline — keep them at LIVE
			if (this.status === 'playing' && !this.isStatic && !this.isSoundcloud) {
				this.time = t;
				this.duration = d;
			}
		};
		// program rolls on — advance to the next song in the channel
		engine.events.ended = () => this.advance();
		// SoundCloud widget reports the live track as it changes
		sc.events.onTrack = (title, artist) => {
			this.scTitle = title;
			this.scArtist = artist;
		};
	}

	get channel(): Channel {
		return this.channels[this.channelIndex];
	}

	get current(): Track | null {
		if (this.status !== 'playing' && this.status !== 'paused') return null;
		if (this.isSoundcloud) {
			return {
				id: 'sc',
				title: this.scTitle || '…',
				artist: this.scArtist || this.channel.name,
				src: '',
				duration: 0
			};
		}
		return this.channel.tracks[this.index] ?? null;
	}

	get isOn(): boolean {
		return this.status !== 'off';
	}

	get isStatic(): boolean {
		return this.channel.kind === 'static';
	}

	get isSoundcloud(): boolean {
		return this.channel.kind === 'soundcloud';
	}

	get progress(): number {
		return this.duration > 0 ? this.time / this.duration : 0;
	}

	/** which track + offset is "live" right now for the current channel */
	private liveSlot(): { index: number; offset: number } {
		const prog = this.channel.tracks;
		if (!prog.length) return { index: 0, offset: 0 };
		const total = prog.reduce((s, t) => s + t.duration, 0);
		if (total <= 0) return { index: 0, offset: 0 };
		let e = (Date.now() / 1000) % total;
		for (let i = 0; i < prog.length; i++) {
			if (e < prog[i].duration) return { index: i, offset: e };
			e -= prog[i].duration;
		}
		return { index: 0, offset: 0 };
	}

	// ── tuning ──────────────────────────────────────────────────────────────
	private async powerOn(): Promise<void> {
		await engine.resume();
		engine.setVolume(this.volume);
	}

	/** tune to a channel (powers on if needed). The audio-unlock gesture. */
	async tuneToChannel(i: number): Promise<void> {
		this.channelIndex = ((i % this.channels.length) + this.channels.length) % this.channels.length;
		const ch = this.channel;
		// SoundCloud autoplay only works if play() fires *inside* the click —
		// so kick it synchronously here, before any await, and resume Web Audio
		// (for the ambient visualizer) in the background.
		if (ch.live && ch.kind === 'soundcloud') {
			engine.stopTrack();
			engine.stopStatic();
			sc.setVolume(this.volume);
			sc.joinLive();
			this.status = 'playing';
			this.time = 0;
			this.duration = 0;
			void this.powerOn();
			return;
		}
		if (!this.isOn) await this.powerOn();
		await this.syncLive();
	}

	/** join the current channel's live signal (static, program, or off-air) */
	private async syncLive(): Promise<void> {
		const ch = this.channel;
		if (!ch.live) {
			engine.stopTrack();
			engine.stopStatic();
			this.status = 'offair';
			this.time = 0;
			this.duration = 0;
			return;
		}
		// pure-static channel: just the (always-on) dead-air noise
		if (ch.kind === 'static') {
			engine.stopTrack();
			sc.pause();
			engine.startStatic();
			this.status = 'playing';
			this.time = 0;
			this.duration = 0;
			return;
		}
		// soundcloud channel: stream the official set, joined at the live position
		if (ch.kind === 'soundcloud') {
			engine.stopTrack();
			engine.stopStatic();
			sc.setVolume(this.volume);
			sc.joinLive();
			this.status = 'playing';
			this.time = 0;
			this.duration = 0;
			return;
		}
		if (!ch.tracks.length) {
			engine.stopTrack();
			engine.stopStatic();
			this.status = 'offair';
			this.time = 0;
			this.duration = 0;
			return;
		}
		// program channel: join the live song mid-play
		engine.stopStatic();
		const slot = this.liveSlot();
		this.index = slot.index;
		this.time = 0;
		this.duration = 0;
		await engine.loadAndPlay(`/${ch.tracks[slot.index].src}`, slot.offset);
		this.status = 'playing';
	}

	/** first click on the screen — tune into the current channel */
	async tuneIn(): Promise<void> {
		await this.tuneToChannel(this.channelIndex);
	}

	cycleChannel(dir: number): void {
		void this.tuneToChannel(this.channelIndex + dir);
	}

	// auto-advance within a channel program (keeps the feed rolling)
	private advance(): void {
		const prog = this.channel.tracks;
		if (!prog.length) return;
		this.index = (this.index + 1) % prog.length;
		this.time = 0;
		this.duration = 0;
		void engine.loadAndPlay(`/${prog[this.index].src}`).then(() => {
			this.status = 'playing';
		});
	}

	// ── playback (no track selection — this is a feed) ──────────────────────
	async togglePlay(): Promise<void> {
		if (!this.isOn) {
			await this.tuneIn();
			return;
		}
		if (this.status === 'offair') {
			await this.syncLive();
			return;
		}
		if (this.status === 'playing') {
			// a live channel can only be paused — never rewound or skipped
			if (this.isStatic) engine.stopStatic();
			else if (this.isSoundcloud) sc.pause();
			else engine.pause();
			this.status = 'paused';
		} else {
			// resume = re-join LIVE (you can't rewind a live feed)
			await this.syncLive();
		}
	}

	/** stop = tune out: silence + snow */
	stop(): void {
		engine.stopTrack();
		engine.stopStatic();
		sc.pause();
		this.status = 'idle';
		this.time = 0;
		this.duration = 0;
	}

	setVolume(v: number): void {
		this.volume = Math.max(0, Math.min(1, v));
		engine.setVolume(this.volume);
		sc.setVolume(this.volume);
	}
}

export const player = new Player();

// dev-only handle for debugging from the console
if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as unknown as { __player: Player }).__player = player;
}
