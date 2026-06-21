<script lang="ts">
	// CRT scanlines + vignette + a slow brightness flicker over the whole screen.
	let { flicker = true }: { flicker?: boolean } = $props();
</script>

<div class="crt" class:flicker aria-hidden="true">
	<div class="scanlines"></div>
	<div class="vignette"></div>
</div>

<style>
	.crt {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 95;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0) 0px,
			rgba(0, 0, 0, 0) 2px,
			rgba(0, 0, 0, 0.22) 3px,
			rgba(0, 0, 0, 0.22) 4px
		);
		opacity: 0.55;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120% 100% at 50% 45%,
			rgba(0, 0, 0, 0) 55%,
			rgba(0, 0, 0, 0.55) 100%
		);
	}

	.flicker {
		animation: flicker var(--flicker, 6s) infinite steps(60);
	}

	@keyframes flicker {
		0%, 100% { opacity: 1; }
		3% { opacity: 0.96; }
		6% { opacity: 1; }
		47% { opacity: 1; }
		48% { opacity: 0.92; }
		49% { opacity: 1; }
		88% { opacity: 1; }
		89% { opacity: 0.97; }
		90% { opacity: 1; }
	}
</style>
