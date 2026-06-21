// ─────────────────────────────────────────────────────────────────────────
// Generates ORIGINAL, royalty-free ambient drones as placeholder broadcasts
// for deadair.nyc. These exist purely to prove the audio pipeline + visualizer.
// Swap them out by dropping your own files in static/audio/ and editing
// src/lib/data/tracks.ts.
//
//   node scripts/gen-audio.mjs
// ─────────────────────────────────────────────────────────────────────────
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'static', 'audio');
mkdirSync(OUT, { recursive: true });

const SR = 32000;
const TAU = Math.PI * 2;

function writeWav(path, left, right) {
	const n = left.length;
	const bytesPerSample = 2;
	const blockAlign = 2 * bytesPerSample;
	const dataLen = n * blockAlign;
	const buf = Buffer.alloc(44 + dataLen);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + dataLen, 4);
	buf.write('WAVE', 8);
	buf.write('fmt ', 12);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20); // PCM
	buf.writeUInt16LE(2, 22); // stereo
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * blockAlign, 28);
	buf.writeUInt16LE(blockAlign, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(dataLen, 40);
	let o = 44;
	for (let i = 0; i < n; i++) {
		const l = Math.max(-1, Math.min(1, left[i]));
		const r = Math.max(-1, Math.min(1, right[i]));
		buf.writeInt16LE((l * 32767) | 0, o);
		buf.writeInt16LE((r * 32767) | 0, o + 2);
		o += 4;
	}
	writeFileSync(path, buf);
	return dataLen;
}

// one-pole lowpassed white noise (air)
function makeNoise(n, cutoff) {
	const out = new Float32Array(n);
	let y = 0;
	const a = cutoff;
	for (let i = 0; i < n; i++) {
		const x = Math.random() * 2 - 1;
		y += a * (x - y);
		out[i] = y;
	}
	return out;
}

function drone({ seconds, root, partials, detune, noiseLevel, swirl }) {
	const n = SR * seconds;
	const left = new Float32Array(n);
	const right = new Float32Array(n);
	const noise = makeNoise(n, 0.02);

	for (let i = 0; i < n; i++) {
		const t = i / SR;
		// gentle breathing swell — stays present, never drops out
		const swell = 0.82 + 0.18 * Math.sin(TAU * 0.06 * t - Math.PI / 2);
		// fade in 2.5s / out 3.5s
		const fin = Math.min(1, t / 2.5);
		const fout = Math.min(1, (seconds - t) / 3.5);
		const env = swell * fin * Math.max(0, fout);

		let l = 0;
		let r = 0;
		for (let p = 0; p < partials.length; p++) {
			const [mult, amp] = partials[p];
			const f = root * mult;
			// slow vibrato/chorus offset per channel
			const lfo = Math.sin(TAU * (0.05 + p * 0.013) * t) * swirl;
			l += amp * Math.sin(TAU * f * (1 - detune) * t + lfo);
			r += amp * Math.sin(TAU * f * (1 + detune) * t - lfo);
		}
		const air = noise[i] * noiseLevel;
		left[i] = (l * 0.3 + air) * env;
		right[i] = (r * 0.3 + air) * env;
	}

	// normalize to a healthy target peak so levels are consistent + visible
	let max = 1e-6;
	for (let i = 0; i < n; i++) {
		max = Math.max(max, Math.abs(left[i]), Math.abs(right[i]));
	}
	const g = 0.78 / max;
	for (let i = 0; i < n; i++) {
		left[i] *= g;
		right[i] *= g;
	}
	return { left, right };
}

const TRACKS = [
	{
		file: 'lowlight.wav',
		seconds: 18,
		root: 55, // A1
		partials: [[1, 1], [2, 0.5], [3, 0.22], [5, 0.12]],
		detune: 0.004,
		noiseLevel: 0.04,
		swirl: 0.6
	},
	{
		file: 'glass.wav',
		seconds: 18,
		root: 196, // G3 — brighter shimmer pad
		partials: [[1, 0.7], [1.5, 0.5], [2, 0.45], [3, 0.2], [4, 0.12]],
		detune: 0.006,
		noiseLevel: 0.05,
		swirl: 1.1
	},
	{
		file: 'bloom.wav',
		seconds: 18,
		root: 110, // A2
		partials: [[1, 0.8], [2, 0.4], [2.5, 0.3], [4, 0.15]],
		detune: 0.005,
		noiseLevel: 0.08,
		swirl: 0.85
	}
];

for (const t of TRACKS) {
	const { left, right } = drone(t);
	const bytes = writeWav(join(OUT, t.file), left, right);
	console.log(`wrote ${t.file}  (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
}
console.log('done →', OUT);
