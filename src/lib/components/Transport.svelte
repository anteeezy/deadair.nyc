<script lang="ts">
	import { player } from '$lib/stores/player.svelte';

	function fmt(s: number): string {
		if (!Number.isFinite(s) || s <= 0) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${String(sec).padStart(2, '0')}`;
	}

	const playing = $derived(player.status === 'playing');
</script>

<div class="transport">
	<!-- read-only live progress (no scrubbing a live feed) -->
	<div class="seekrow">
		<span class="t">{fmt(player.time)}</span>
		<div class="bar" class:live={playing}>
			<div class="ticks"></div>
			<div class="fill" style="width: {player.progress * 100}%"></div>
		</div>
		<span class="t right" class:livebadge={playing}>
			{#if playing}<i class="dot"></i> LIVE{:else}OFF{/if}
		</span>
	</div>

	<!-- transport: prev/next cycle CHANNELS, not tracks -->
	<div class="cluster">
		<label class="vol" aria-label="volume">
			<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 Z" /></svg>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={player.volume}
				oninput={(e) => player.setVolume(+e.currentTarget.value)}
			/>
		</label>

		<div class="btns">
			<button class="rb" onclick={() => player.cycleChannel(-1)} aria-label="previous channel">
				<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 5 v14 M19 5 L9 12 L19 19 Z" /></svg>
			</button>
			<button class="rb big" onclick={() => player.togglePlay()} aria-label={playing ? 'pause' : 'play'}>
				{#if playing}
					<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
				{:else}
					<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 4 L20 12 L8 20 Z" /></svg>
				{/if}
			</button>
			<button class="rb" onclick={() => player.stop()} aria-label="tune out">
				<svg viewBox="0 0 24 24" width="15" height="15"><rect x="5" y="5" width="14" height="14" /></svg>
			</button>
			<button class="rb" onclick={() => player.cycleChannel(1)} aria-label="next channel">
				<svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 5 v14 M5 5 L15 12 L5 19 Z" /></svg>
			</button>
		</div>

		<span class="chlabel">CH ▸ {player.channel.name}</span>
	</div>
</div>

<style>
	.transport {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 0.7rem 0.3rem 0.4rem;
	}

	.seekrow {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		font-size: 1rem;
		color: var(--text-dim);
		padding: 0 0.4rem;
	}
	.t {
		min-width: 3.4em;
	}
	.t.right {
		text-align: right;
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;
	}
	.livebadge {
		color: var(--blood-bright);
		letter-spacing: 0.1em;
	}
	.livebadge .dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--blood-bright);
		box-shadow: 0 0 6px var(--blood-glow);
		animation: blink 1.1s steps(2) infinite;
	}
	@keyframes blink {
		50% { opacity: 0.2; }
	}

	.bar {
		position: relative;
		flex: 1;
		height: 12px;
		background: #000;
		box-shadow: inset 1px 1px 0 var(--bevel-dark), inset -1px -1px 0 rgba(255, 255, 255, 0.05);
		overflow: hidden;
	}
	.ticks {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			90deg,
			transparent 0,
			transparent 7px,
			rgba(255, 255, 255, 0.1) 7px,
			rgba(255, 255, 255, 0.1) 8px
		);
	}
	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: linear-gradient(180deg, #ededf0, var(--blood) 60%, #2a2a2e);
		box-shadow: 0 0 8px var(--blood-glow);
		opacity: 0.6;
	}
	.bar.live .fill {
		opacity: 1;
	}

	.cluster {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}
	.btns {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.chlabel {
		justify-self: end;
		font-family: var(--font-mono);
		font-size: 1rem;
		color: var(--text-dim);
		letter-spacing: 0.06em;
		padding-right: 0.4rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rb {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #d7cfc8;
		background:
			radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 55%),
			linear-gradient(180deg, #2a2a30, #0e0e12);
		border: 1px solid #000;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.18),
			inset 0 -2px 4px rgba(0, 0, 0, 0.6),
			0 2px 3px rgba(0, 0, 0, 0.7);
		transition: filter 0.1s, transform 0.05s;
	}
	.rb :global(svg) {
		fill: currentColor;
		stroke: currentColor;
		stroke-width: 0;
	}
	.rb:hover:not(:disabled) {
		filter: brightness(1.35);
	}
	.rb:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.85);
	}
	.rb.big {
		width: 54px;
		height: 54px;
		color: #15151a; /* dark glyph on the silver button — chrome WMP look */
		background:
			radial-gradient(circle at 50% 26%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 55%),
			linear-gradient(180deg, #dcdce0, #9a9aa0 52%, #45454c);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			inset 0 -3px 6px rgba(0, 0, 0, 0.45),
			0 0 14px rgba(232, 234, 240, 0.28),
			0 2px 4px rgba(0, 0, 0, 0.75);
	}

	.vol {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-dim);
		padding-left: 0.4rem;
	}
	.vol :global(svg) {
		fill: currentColor;
	}
	.vol input {
		width: 72px;
		accent-color: var(--blood-bright);
		height: 3px;
		cursor: pointer;
	}

	@media (max-width: 480px) {
		.vol input {
			width: 44px;
		}
		.chlabel {
			font-size: 0.85rem;
		}
	}
</style>
