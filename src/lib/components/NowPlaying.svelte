<script lang="ts">
	import { player } from '$lib/stores/player.svelte';

	const playing = $derived(player.status === 'playing');

	const statusLabel = $derived(
		player.status === 'playing'
			? 'LIVE'
			: player.status === 'paused'
				? 'PAUSED'
				: player.status === 'offair'
					? 'OFF AIR'
					: 'STANDBY'
	);

	const line = $derived(
		player.status === 'offair'
			? '— off air · coming soon —'
			: player.isStatic && player.isOn
				? '▒ just static · dead air ▒'
				: player.current
					? `${player.current.artist} — ${player.current.title}`
					: 'tune in to start the feed'
	);
</script>

<div class="np">
	<div class="head">
		<span class="label">deadair</span>
		<span class="chan">▸ {player.channel.name}</span>
		<span class="status" class:live={playing}>{statusLabel}</span>
		<span class="dot" class:live={playing} aria-hidden="true"></span>
	</div>

	<div class="line" title={line}>{line}</div>
</div>

<style>
	.np {
		flex: none;
		padding: 0.7rem 0.9rem 0.6rem;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent);
	}

	.head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-display);
		font-weight: 600;
		letter-spacing: 0.05em;
	}
	.label {
		color: var(--text);
		font-size: 1rem;
	}
	.chan {
		font-family: var(--font-mono);
		font-size: 1.05rem;
		color: var(--blood-bright);
		letter-spacing: 0.08em;
	}
	.status {
		margin-left: auto;
		font-size: 0.9rem;
		color: var(--text-dim);
		letter-spacing: 0.15em;
	}
	.status.live {
		color: var(--blood-bright);
		text-shadow: 0 0 8px var(--blood-glow);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-faint);
	}
	.dot.live {
		background: var(--blood-bright);
		box-shadow: 0 0 8px var(--blood-glow);
		animation: pulse 1.4s ease-in-out infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.35; }
	}

	.line {
		margin-top: 0.4rem;
		font-family: var(--font-mono);
		font-size: 1.25rem;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-shadow: 0 0 6px rgba(232, 234, 240, 0.18);
	}
</style>
