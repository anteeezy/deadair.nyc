<script lang="ts">
	// Animated film-grain overlay using an inline SVG turbulence as a tiled
	// background, jittered each frame via @keyframes. Cheap, GPU-friendly.
	let { opacity = 0.05 }: { opacity?: number } = $props();

	// fractal noise tile, base64-free data URI
	const NOISE =
		"data:image/svg+xml;utf8," +
		encodeURIComponent(
			`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
				<filter id='n'>
					<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
					<feColorMatrix type='saturate' values='0'/>
				</filter>
				<rect width='100%' height='100%' filter='url(#n)'/>
			</svg>`
		);
</script>

<div class="grain" style="--noise: url('{NOISE}'); --grain-opacity: {opacity};"></div>

<style>
	.grain {
		position: absolute;
		inset: -50%;
		width: 200%;
		height: 200%;
		pointer-events: none;
		z-index: 90;
		background-image: var(--noise);
		opacity: var(--grain-opacity);
		mix-blend-mode: screen;
		animation: grain 0.6s steps(4) infinite;
		will-change: transform;
	}

	@keyframes grain {
		0% { transform: translate(0, 0); }
		25% { transform: translate(-3%, 2%); }
		50% { transform: translate(2%, -4%); }
		75% { transform: translate(-2%, -2%); }
		100% { transform: translate(3%, 3%); }
	}
</style>
