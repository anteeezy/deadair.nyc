<script lang="ts">
	// The "screen". Shares the engine's AnalyserNode:
	//   off       → black
	//   dead-air  → crunchy TV snow (rendered small, scaled up nearest-neighbor)
	//   playing   → oscilloscope + frequency bars over a faint snow underlay
	import { engine } from '$lib/audio/engine';
	import { player } from '$lib/stores/player.svelte';

	const PHOSPHOR = '#ededf0';
	const AIR = '#ededf0';

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	$effect(() => {
		const c = canvas;
		const g = c.getContext('2d');
		if (!g) return;

		const snow = document.createElement('canvas');
		const sg = snow.getContext('2d')!;

		let raf = 0;
		let roll = 0;

		const resize = () => {
			const r = host.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			c.width = Math.max(1, Math.floor(r.width * dpr));
			c.height = Math.max(1, Math.floor(r.height * dpr));
			snow.width = Math.max(1, Math.floor(r.width / 3));
			snow.height = Math.max(1, Math.floor(r.height / 3));
		};
		const ro = new ResizeObserver(resize);
		ro.observe(host);
		resize();

		const freq = new Uint8Array(1024);
		// eased spectrum + slow drift state for the hazy bloom visual
		const N = 80;
		const spec = new Float32Array(N);
		let phase = 0;
		let bassEnv = 0;

		const drawSnow = (intensity: number) => {
			const w = snow.width;
			const h = snow.height;
			const img = sg.createImageData(w, h);
			const d = img.data;
			for (let i = 0; i < d.length; i += 4) {
				const v = Math.random() * 255 * intensity;
				d[i] = d[i + 1] = d[i + 2] = v;
				d[i + 3] = 255;
			}
			sg.putImageData(img, 0, 0);
			g.imageSmoothingEnabled = false;
			g.globalAlpha = intensity < 0.5 ? 0.5 : 1;
			g.drawImage(snow, 0, 0, c.width, c.height);
			g.globalAlpha = 1;
		};

		const frame = () => {
			const a = engine.analyser;
			const W = c.width;
			const H = c.height;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			if (player.status === 'off' || !a) {
				g.fillStyle = '#050507';
				g.fillRect(0, 0, W, H);
				raf = requestAnimationFrame(frame);
				return;
			}

			if (
				player.status === 'idle' ||
				player.status === 'paused' ||
				player.status === 'offair' ||
				(player.status === 'playing' && player.isStatic)
			) {
				g.fillStyle = '#050507';
				g.fillRect(0, 0, W, H);
				drawSnow(0.95);
				// a faint rolling brightness band, like an untuned channel
				roll = (roll + 1.5) % H;
				const grad = g.createLinearGradient(0, roll - 60, 0, roll + 60);
				grad.addColorStop(0, 'rgba(232,234,240,0)');
				grad.addColorStop(0.5, 'rgba(232,234,240,0.08)');
				grad.addColorStop(1, 'rgba(232,234,240,0)');
				g.fillStyle = grad;
				g.fillRect(0, roll - 60, W, 120);
				raf = requestAnimationFrame(frame);
				return;
			}

			// playing a track — one quiet, dim line that drifts. barely there.
			// soundcloud audio can't be analysed (cross-origin) → gentle ambient.
			const ambient = player.isSoundcloud;
			if (!ambient) a.getByteFrequencyData(freq);

			// very short, faint trail (gentle smear, not a bloom)
			g.globalAlpha = 0.78;
			g.imageSmoothingEnabled = true;
			g.drawImage(c, -dpr * 0.4, -dpr * 0.9, W + dpr * 0.8, H + dpr * 1.4);
			g.globalAlpha = 1;
			g.fillStyle = 'rgba(4,4,6,0.24)';
			g.fillRect(0, 0, W, H);

			// a slow, organic swell (two out-of-phase LFOs) so the whole shape
			// grows and recedes — for ambient this *is* the dynamics; for real
			// audio it's overridden by the bass envelope below.
			const swell = 0.5 + 0.5 * (0.62 * Math.sin(phase * 0.5) + 0.38 * Math.sin(phase * 0.17 + 1.3));

			// ease the spectrum toward the music (slow = calm, not jittery)
			for (let i = 0; i < N; i++) {
				const target = ambient
					? 0.4 * (0.5 + 0.5 * Math.sin(i * 0.3 + phase * 1.4))
					: freq[Math.floor((i / N) ** 1.4 * freq.length * 0.6)] / 255;
				spec[i] += (target - spec[i]) * 0.06;
			}
			let bass = 0;
			for (let i = 0; i < 6; i++) bass += freq[i];
			bassEnv += ((ambient ? swell : bass / (6 * 255)) - bassEnv) * 0.05;
			phase += 0.014;

			const mid = H * 0.54;
			// wider range so the breathing is actually visible
			const ampMax = H * (0.1 + bassEnv * 0.22);
			const amp = (i: number) => {
				const drift = Math.sin(i * 0.5 + phase) * 0.04;
				return Math.min(1, Math.max(0, spec[i] + drift)) * ampMax;
			};

			// a single dim, softly-glowing line
			g.shadowBlur = 6;
			g.shadowColor = 'rgba(210,216,228,0.3)';
			g.lineWidth = Math.max(1, dpr);
			g.strokeStyle = 'rgba(206,210,220,0.42)';
			g.beginPath();
			for (let i = 0; i < N; i++) {
				const x = (i / (N - 1)) * W;
				const y = mid - amp(i);
				i ? g.lineTo(x, y) : g.moveTo(x, y);
			}
			g.stroke();
			g.shadowBlur = 0;

			raf = requestAnimationFrame(frame);
		};

		frame();
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});
</script>

<div class="host" bind:this={host}>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.host {
		position: absolute;
		inset: 0;
	}
	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
