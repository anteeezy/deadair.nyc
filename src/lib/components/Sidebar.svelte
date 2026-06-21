<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import Blinkies from './Blinkies.svelte';

	const listening = $derived(
		player.current ? `${player.current.artist} — ${player.current.title}` : 'press play ✶ tune in'
	);
	// fake-but-fun hit counter, seeded, ticks slowly
	let hits = $state(13666);
	$effect(() => {
		const id = setInterval(() => (hits += Math.floor(Math.random() * 3)), 4000);
		return () => clearInterval(id);
	});
	const odo = $derived(String(hits).padStart(6, '0'));
</script>

<aside class="sidebar">
	<!-- profile plaque -->
	<div class="module">
		<div class="bar">deadair</div>
		<div class="plaque">
			<div class="pic recessed">
				<span class="cross">✶</span>
			</div>
			<div class="meta">
				<div class="name">DEAD AIR</div>
				<div class="sub">"tapes for the sleepless"</div>
				<div class="rows">
					<span class="online"><i></i> online now</span>
					<span>New York, NY</span>
				</div>
			</div>
		</div>
	</div>

	<!-- mood + now listening -->
	<div class="module">
		<div class="bar">blurbs</div>
		<div class="pad">
			<p><b>mood:</b> fuzzed out <span class="emo">(-_-)</span></p>
			<p><b>now listening:</b><br /><span class="hl">{listening}</span></p>
			<p>
				<b>about:</b> a place to disappear into the noise — loud guitars and soft static, the
				songs you only put on after midnight. no genre, no pictures. just sound.
			</p>
		</div>
	</div>

	<!-- counter -->
	<div class="module">
		<div class="bar">visitors</div>
		<div class="pad center">
			<div class="counter">
				{#each odo.split('') as d}<span class="digit">{d}</span>{/each}
			</div>
			<div class="since">visitors since 06 / 2026</div>
		</div>
	</div>

	<!-- blinkies -->
	<div class="module">
		<div class="bar">buttons</div>
		<Blinkies />
	</div>
</aside>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 240px;
		flex: none;
	}
	.pad {
		padding: 8px 10px;
	}
	.pad p {
		margin: 0 0 8px;
	}
	.pad b {
		color: var(--blood-bright);
		text-transform: uppercase;
		font-size: 11px;
		letter-spacing: 0.05em;
	}
	.center {
		text-align: center;
	}
	.hl {
		color: var(--bone);
		font-style: italic;
	}
	.emo {
		color: var(--text-dim);
	}

	.plaque {
		display: flex;
		gap: 8px;
		padding: 8px;
	}
	.pic {
		width: 64px;
		height: 64px;
		flex: none;
		display: grid;
		place-items: center;
	}
	.cross {
		font-size: 30px;
		color: var(--blood);
		text-shadow: 0 0 10px var(--blood-glow);
	}
	.meta {
		min-width: 0;
	}
	.name {
		font-family: var(--font-goth);
		font-size: 22px;
		color: var(--bone);
		line-height: 1;
	}
	.sub {
		font-style: italic;
		color: var(--text-dim);
		font-size: 11px;
		margin: 2px 0 6px;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 11px;
		color: var(--text-dim);
	}
	.online {
		display: flex;
		align-items: center;
		gap: 5px;
		color: #8fd18f;
	}
	.online i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #43d043;
		box-shadow: 0 0 6px #43d043;
		animation: pulse 1.6s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}

	.counter {
		display: inline-flex;
		gap: 2px;
		padding: 4px;
		background: #000;
		border: 1px solid #000;
		box-shadow: inset 0 0 0 1px #1c1c22;
	}
	.digit {
		font-family: var(--font-mono);
		font-size: 22px;
		width: 16px;
		text-align: center;
		color: var(--blood-bright);
		background: linear-gradient(180deg, #14141a, #000);
		text-shadow: 0 0 6px var(--blood-glow);
	}
	.since {
		margin-top: 5px;
		font-size: 10px;
		color: var(--text-faint);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	@media (max-width: 760px) {
		.sidebar {
			width: 100%;
		}
	}
</style>
