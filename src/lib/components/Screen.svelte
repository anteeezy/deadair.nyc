<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import Visualizer from './Visualizer.svelte';

	const powering = $derived(player.status === 'off');
	const playing = $derived(player.status === 'playing');
	const offair = $derived(player.status === 'offair');
	const chName = $derived(player.channel.name);

	function tc(s: number): string {
		const sec = Math.floor(s % 60);
		const min = Math.floor(s / 60);
		return `0:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	// one-shot CRT power-on flash when leaving the off state
	let flashing = $state(false);
	let wasOff = true;
	$effect(() => {
		const off = player.status === 'off';
		if (wasOff && !off) {
			flashing = true;
			setTimeout(() => (flashing = false), 700);
		}
		wasOff = off;
	});
</script>

<div class="screen recessed">
	<Visualizer />

	<!-- camcorder OSD burned into the video -->
	{#if !powering}
		<div class="osd" aria-hidden="true">
			<div class="tl">
				<span class="batt">▮▮▮▯ 68<small>min</small></span>
				<span class="mode">STEREO</span>
			</div>
			<div class="tr">
				<span class="sp">SP</span>
				{#if playing}
					<span class="rec"><i></i> LIVE</span>
				{:else if offair}
					<span class="stby">OFF AIR</span>
				{:else}
					<span class="stby">STBY</span>
				{/if}
			</div>
			<div class="bl">
				<span class="tcode">{tc(player.time)}</span>
				<span class="warm">{playing ? `DA▸TV · ${chName}` : offair ? 'OFF AIR — COMING SOON' : 'CAMERA WARMING ●'}</span>
			</div>
			<div class="br">16 BIT</div>
		</div>
	{/if}

	{#if flashing}
		<div class="poweron"></div>
	{/if}

	<!-- power-on overlay (also the audio-unlock gesture) -->
	{#if powering}
		<button class="power" onclick={() => player.tuneIn()}>
			<span class="playbtn">
				<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8.5 5 L19 12 L8.5 19 Z" /></svg>
			</span>
			<span class="cap">click to play</span>
		</button>
	{/if}
</div>

<style>
	.screen {
		position: relative;
		flex: none;
		width: 100%;
		height: clamp(240px, 42vh, 340px);
		overflow: hidden;
		background: var(--screen);
	}

	/* ── camcorder OSD ── */
	.osd {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		font-family: var(--font-mono);
		font-size: 1.05rem;
		text-shadow: 0 0 4px #000, 0 1px 2px #000;
	}
	.osd > div {
		position: absolute;
		display: flex;
		gap: 0.5rem;
	}
	.tl {
		top: 8px;
		left: 10px;
		flex-direction: column;
		gap: 1px;
		color: #d8d2cc;
	}
	.tl small {
		font-size: 0.7em;
	}
	.tl .mode {
		color: #8fd18f;
		font-size: 0.85rem;
	}
	.tr {
		top: 8px;
		right: 10px;
		align-items: center;
	}
	.tr .sp {
		color: #6fe0ff;
		font-weight: 700;
	}
	.rec {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		/* the one spot of color — a subtle REC-light red */
		color: #c8554e;
		text-shadow: 0 0 7px rgba(200, 70, 62, 0.5);
	}
	.rec i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #cf4a42;
		box-shadow: 0 0 8px rgba(207, 74, 66, 0.7);
		animation: recblink 1.1s steps(2) infinite;
	}
	.stby {
		color: #c9c0b8;
		opacity: 0.7;
	}
	@keyframes recblink {
		50% {
			opacity: 0.15;
		}
	}
	.bl {
		bottom: 8px;
		left: 10px;
		flex-direction: column;
		gap: 1px;
		color: #d8d2cc;
	}
	.bl .warm {
		color: var(--blood-bright);
		font-size: 0.85rem;
	}
	.br {
		bottom: 8px;
		right: 10px;
		color: #d8d2cc;
		font-weight: 700;
	}

	/* CRT turn-on flash */
	.poweron {
		position: absolute;
		inset: 0;
		z-index: 6;
		background: #fff;
		pointer-events: none;
		transform-origin: center;
		animation: crton 0.7s ease-out forwards;
	}
	@keyframes crton {
		0% { transform: scaleY(0.006); opacity: 1; }
		18% { transform: scaleY(0.012); opacity: 1; }
		38% { transform: scaleY(1); opacity: 0.95; }
		55% { opacity: 0.55; background: #8a8a92; }
		100% { transform: scaleY(1); opacity: 0; }
	}

	.power {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: radial-gradient(circle at 50% 45%, rgba(10, 10, 14, 0.5), rgba(1, 1, 2, 0.86));
	}
	/* classic chrome media-player play button — beveled, skeuomorphic */
	.playbtn {
		display: grid;
		place-items: center;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		color: #15151a;
		border: 1px solid #000;
		background:
			radial-gradient(circle at 50% 26%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 52%),
			linear-gradient(180deg, #e6e6ea, #b4b4ba 48%, #6c6c74 52%, #34343a);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.85),
			inset 0 -3px 7px rgba(0, 0, 0, 0.5),
			0 3px 6px rgba(0, 0, 0, 0.7),
			0 0 0 4px rgba(255, 255, 255, 0.04);
		transition: transform 0.08s, filter 0.12s;
	}
	.playbtn :global(svg) {
		fill: currentColor;
		filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.4));
	}
	.power:hover .playbtn {
		filter: brightness(1.08);
	}
	.power:active .playbtn {
		transform: translateY(1px);
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.7);
	}
	.cap {
		font-family: var(--font-body);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--text-dim);
		text-shadow: 0 1px 2px #000;
	}
</style>
