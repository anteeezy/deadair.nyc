<script lang="ts">
	import { player } from '$lib/stores/player.svelte';

	const tuned = (i: number) => player.isOn && player.channelIndex === i;
	const playingHere = (i: number) => tuned(i) && player.status === 'playing';
</script>

<div class="guide">
	<div class="hd">
		<span>CHANNELS</span>
		<span class="count">{player.channels.filter((c) => c.live).length} live</span>
	</div>

	<ul>
		{#each player.channels as ch, i (ch.id)}
			<li>
				<button
					class="row"
					class:active={tuned(i)}
					class:offair={!ch.live}
					onclick={() => player.tuneToChannel(i)}
				>
					<span class="num">{String(i + 1).padStart(2, '0')}</span>
					<span class="name">{ch.name}</span>
					{#if ch.live}
						<span class="now">
							{#if playingHere(i) && player.current}{player.current.artist} — {player.current.title}{:else}{ch.tagline}{/if}
						</span>
					{:else}
						<span class="now off">— off air · {ch.tagline}</span>
					{/if}
					{#if playingHere(i)}
						<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
					{:else if ch.live}
						<span class="live-tag">LIVE</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.guide {
		flex: none;
		border-top: 1px solid var(--line);
		max-height: 150px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.hd {
		display: flex;
		justify-content: space-between;
		padding: 0.35rem 0.9rem;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		letter-spacing: 0.18em;
		color: var(--text-faint);
		background: rgba(255, 255, 255, 0.015);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-y: auto;
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		width: 100%;
		padding: 0.34rem 0.9rem;
		text-align: left;
		font-family: var(--font-mono);
		font-size: 1.15rem;
		color: var(--text-dim);
		transition: background 0.12s, color 0.12s;
	}
	.row:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.03);
	}
	.row.active {
		color: #fff;
		background: linear-gradient(90deg, rgba(232, 234, 240, 0.14), transparent);
	}
	.row.offair {
		color: var(--text-faint);
	}
	.row.offair:hover {
		color: var(--text-dim);
	}
	.num {
		color: var(--text-faint);
		min-width: 1.8em;
	}
	.name {
		color: inherit;
		min-width: 5.2em;
	}
	.now {
		flex: 1;
		font-size: 0.95rem;
		color: var(--text-faint);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row.active .now {
		color: var(--blood-bright);
	}
	.now.off {
		font-style: italic;
	}

	.live-tag {
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		color: var(--blood-dim);
		border: 1px solid var(--blood-dim);
		padding: 0 4px;
		align-self: center;
	}
	.row.active .live-tag {
		color: var(--blood-bright);
		border-color: var(--blood);
	}

	.eq {
		margin-left: auto;
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 12px;
		align-self: center;
	}
	.eq i {
		width: 3px;
		background: var(--blood-bright);
		box-shadow: 0 0 5px var(--blood-glow);
		animation: eq 0.8s ease-in-out infinite;
	}
	.eq i:nth-child(1) { height: 60%; animation-delay: -0.2s; }
	.eq i:nth-child(2) { height: 100%; animation-delay: -0.5s; }
	.eq i:nth-child(3) { height: 40%; animation-delay: -0.1s; }
	@keyframes eq {
		0%, 100% { transform: scaleY(0.4); }
		50% { transform: scaleY(1); }
	}
</style>
