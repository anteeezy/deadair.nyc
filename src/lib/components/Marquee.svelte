<script lang="ts">
	let {
		text = '',
		speed = 28
	}: { text?: string; speed?: number } = $props();
	// duplicate the text so the loop is seamless
	const run = $derived(`${text}　✶　`);
</script>

<div class="marquee">
	<div class="track" style="--dur: {speed}s">
		<span>{run}</span><span>{run}</span><span>{run}</span><span>{run}</span>
	</div>
</div>

<style>
	.marquee {
		overflow: hidden;
		white-space: nowrap;
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		background: linear-gradient(180deg, #121216, #08080a);
		box-shadow: inset 0 1px 0 rgba(232, 234, 240, 0.16);
		padding: 2px 0;
	}
	.track {
		display: inline-block;
		white-space: nowrap;
		animation: crawl var(--dur) linear infinite;
		font-family: var(--font-mono);
		font-size: 16px;
		letter-spacing: 0.05em;
		color: var(--blood-bright);
		text-shadow: 0 0 6px var(--blood-glow);
	}
	.track span {
		padding-right: 1rem;
	}
	@keyframes crawl {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	.marquee:hover .track {
		animation-play-state: paused;
	}
</style>
