// ─────────────────────────────────────────────────────────────────────────
// deadair audio engine
//
// One AudioContext. Signal chain:
//
//   noiseSource ─┐
//                ├─► master(gain) ─► analyser ─► destination
//   <audio> ─────┘
//
// The shared analyser feeds the on-screen visualizer, so the screen reacts
// to whatever is playing — dead-air static or a real track.
//
// UI never touches WebAudio directly: the store calls these methods, the
// engine reports time/ended back through `events`.
// ─────────────────────────────────────────────────────────────────────────

import { createNoiseBuffer, type NoiseType } from './noise';

export interface EngineEvents {
	time?: (time: number, duration: number) => void;
	ended?: () => void;
}

class AudioEngine {
	ctx: AudioContext | null = null;
	analyser: AnalyserNode | null = null;
	events: EngineEvents = {};

	private master: GainNode | null = null;
	private noiseGain: GainNode | null = null;
	private noiseFilter: BiquadFilterNode | null = null;
	private trackGain: GainNode | null = null;
	private noiseSource: AudioBufferSourceNode | null = null;
	private el: HTMLAudioElement | null = null;
	private elSource: MediaElementAudioSourceNode | null = null;
	private raf = 0;

	get ready(): boolean {
		return this.ctx !== null;
	}

	/** Lazily build the graph. Safe to call repeatedly. */
	private init(): void {
		if (this.ctx) return;
		const Ctor: typeof AudioContext =
			window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		const ctx = new Ctor();

		this.master = ctx.createGain();
		this.master.gain.value = 0.8;

		this.analyser = ctx.createAnalyser();
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0.82;

		this.noiseGain = ctx.createGain();
		this.noiseGain.gain.value = 0;
		// soft warm hiss: roll the harsh highs off the noise so it's gentle to
		// sit with (closer to distant rain / tape hiss than aggressive TV static)
		this.noiseFilter = ctx.createBiquadFilter();
		this.noiseFilter.type = 'lowpass';
		this.noiseFilter.frequency.value = 1700;
		this.noiseFilter.Q.value = 0.4;

		this.trackGain = ctx.createGain();
		this.trackGain.gain.value = 1;

		this.noiseGain.connect(this.noiseFilter);
		this.noiseFilter.connect(this.master);
		this.trackGain.connect(this.master);
		this.master.connect(this.analyser);
		this.analyser.connect(ctx.destination);

		this.ctx = ctx;
	}

	/** Must be called from a user gesture (the power-on click). */
	async resume(): Promise<void> {
		this.init();
		if (this.ctx!.state === 'suspended') await this.ctx!.resume();
	}

	// ── dead air ──────────────────────────────────────────────────────────
	startStatic(type: NoiseType = 'pink', level = 0.07): void {
		this.init();
		this.stopStatic();
		const buf = createNoiseBuffer(this.ctx!, type, 2);
		const src = this.ctx!.createBufferSource();
		src.buffer = buf;
		src.loop = true;
		src.connect(this.noiseGain!);
		src.start();
		this.noiseSource = src;
		this.setStaticLevel(level);
		this.runClock();
	}

	stopStatic(): void {
		if (this.noiseSource) {
			try {
				this.noiseSource.stop();
			} catch {
				/* already stopped */
			}
			this.noiseSource.disconnect();
			this.noiseSource = null;
		}
	}

	setStaticLevel(v: number): void {
		if (this.noiseGain && this.ctx) {
			this.noiseGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
		}
	}

	// ── tracks (HTMLAudioElement → MediaElementSource) ──────────────────────
	private ensureEl(): void {
		if (this.el) return;
		this.init();
		const el = new Audio();
		el.crossOrigin = 'anonymous';
		el.preload = 'auto';
		el.addEventListener('ended', () => this.events.ended?.());
		// drive time from the media element too (fires ~4Hz, even in a
		// backgrounded tab where rAF is paused) so now-playing stays live
		el.addEventListener('timeupdate', () =>
			this.events.time?.(el.currentTime || 0, Number.isFinite(el.duration) ? el.duration : 0)
		);
		this.elSource = this.ctx!.createMediaElementSource(el);
		this.elSource.connect(this.trackGain!);
		this.el = el;
	}

	async loadAndPlay(src: string, offset = 0): Promise<void> {
		this.ensureEl();
		await this.resume();
		const el = this.el!;
		el.src = src;
		// join the program mid-song (live), once metadata is known
		if (offset > 0) {
			await new Promise<void>((resolve) => {
				const onMeta = () => {
					el.removeEventListener('loadedmetadata', onMeta);
					resolve();
				};
				el.addEventListener('loadedmetadata', onMeta);
			});
			try {
				el.currentTime = offset;
			} catch {
				/* ignore unseekable */
			}
		}
		await el.play();
		this.runClock();
	}

	play(): void {
		this.el?.play();
	}

	pause(): void {
		this.el?.pause();
	}

	stopTrack(): void {
		if (this.el) {
			this.el.pause();
			this.el.currentTime = 0;
		}
	}

	seek(t: number): void {
		if (this.el && Number.isFinite(t)) this.el.currentTime = t;
	}

	/** Master output volume (0–1). */
	setVolume(v: number): void {
		if (this.master && this.ctx) {
			this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
		}
	}

	// ── time reporting ──────────────────────────────────────────────────────
	private runClock(): void {
		if (this.raf) return; // single rAF loop
		const tick = () => {
			if (this.el) {
				this.events.time?.(
					this.el.currentTime || 0,
					Number.isFinite(this.el.duration) ? this.el.duration : 0
				);
			}
			this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	}
}

// module-singleton; only instantiated in the browser via method calls
export const engine = new AudioEngine();

// dev-only handle for debugging the audio graph from the console
if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as unknown as { __engine: AudioEngine }).__engine = engine;
}
