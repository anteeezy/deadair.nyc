<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import Screen from './Screen.svelte';
	import NowPlaying from './NowPlaying.svelte';
	import ChannelGuide from './ChannelGuide.svelte';
	import Transport from './Transport.svelte';

	const tabs = ['Now Playing', 'Library', 'Rip', 'Burn', 'Sync'];

	const caption = $derived(
		player.current ? `${player.current.title} — ${player.current.artist}` : 'Dead Air — Untuned Static'
	);
</script>

<div class="wmp-wrap">
	<section class="wmp">
		<!-- titlebar -->
		<header class="titlebar">
			<span class="tt">
				<span class="orb"></span>
				deadair media player
			</span>
			<span class="winbtns" aria-hidden="true">
				<span class="wb min">_</span>
				<span class="wb max">▢</span>
				<span class="wb close">✕</span>
			</span>
		</header>

		<!-- tabs -->
		<nav class="tabs" aria-hidden="true">
			{#each tabs as t, i}
				<span class="tab" class:active={i === 0}>{t}</span>
			{/each}
			<span class="chev">»</span>
		</nav>

		<div class="body">
			<Screen />
			<NowPlaying />
			<ChannelGuide />
			<Transport />
		</div>
	</section>

	<!-- blackletter caption below the window, like the HIM ref -->
	<div class="caption">{caption}</div>
</div>

<style>
	.wmp-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.wmp {
		width: 100%;
		border: 1px solid #000;
		border-radius: 4px 4px 2px 2px;
		background: linear-gradient(180deg, var(--chrome) 0%, #131318 6%, var(--ink) 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.12),
			0 0 0 1px rgba(0, 0, 0, 0.8),
			0 18px 40px rgba(0, 0, 0, 0.8),
			0 0 30px rgba(160, 6, 14, 0.12);
		overflow: hidden;
	}

	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 26px;
		padding: 0 6px 0 8px;
		background: linear-gradient(180deg, #3a3a42 0%, #1f1f26 45%, #121217 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
	}
	.tt {
		display: flex;
		align-items: center;
		gap: 7px;
		font-family: Tahoma, sans-serif;
		font-size: 12px;
		color: #d7cfc8;
		text-shadow: 0 1px 1px #000;
	}
	.orb {
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #f4f4f6, var(--blood) 55%, #2a2a2e);
		box-shadow: 0 0 6px var(--blood-glow), inset 0 0 2px rgba(255, 255, 255, 0.5);
	}
	.winbtns {
		display: flex;
		gap: 3px;
	}
	.wb {
		width: 21px;
		height: 17px;
		display: grid;
		place-items: center;
		font-size: 10px;
		color: #cfc7c0;
		background: linear-gradient(180deg, #34343c, #16161b);
		border: 1px solid #000;
		border-radius: 2px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
	}
	.wb.close {
		background: linear-gradient(180deg, #3c3c44, #18181c);
		color: #d6d5d3;
	}

	.tabs {
		display: flex;
		align-items: stretch;
		gap: 1px;
		height: 24px;
		padding: 0 4px;
		background: linear-gradient(180deg, #16161b, #0a0a0d);
		border-bottom: 1px solid #000;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}
	.tab {
		display: flex;
		align-items: center;
		padding: 0 12px;
		font-family: Tahoma, sans-serif;
		font-size: 11px;
		color: var(--text-dim);
		border-bottom: 2px solid transparent;
	}
	.tab.active {
		color: #fff;
		border-bottom-color: var(--blood-bright);
		text-shadow: 0 0 8px var(--blood-glow);
	}
	.chev {
		margin-left: auto;
		display: flex;
		align-items: center;
		padding: 0 6px;
		color: var(--text-faint);
	}

	.body {
		padding: 8px;
	}

	.caption {
		margin-top: 14px;
		font-family: var(--font-goth2);
		font-size: clamp(22px, 4vw, 34px);
		color: var(--bone);
		text-align: center;
		text-shadow: 0 0 18px rgba(220, 224, 232, 0.28), 0 2px 0 #000;
		letter-spacing: 0.04em;
	}
</style>
