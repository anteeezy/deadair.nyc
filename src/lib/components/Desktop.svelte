<script lang="ts">
	import type { Snippet } from 'svelte';
	import Marquee from './Marquee.svelte';
	import Clock from './effects/Clock.svelte';
	import Grain from './effects/Grain.svelte';
	import Scanlines from './effects/Scanlines.svelte';
	import Sidebar from './Sidebar.svelte';
	import Shoutbox from './Shoutbox.svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="page">
	<!-- shoegaze haze: soft out-of-focus blooms drifting behind everything -->
	<div class="haze h1" aria-hidden="true"></div>
	<div class="haze h2" aria-hidden="true"></div>

	<div class="wrap">
		<header class="head">
			<div class="topline">
				<span>last seen: <b>tonight</b></span>
				<Clock />
			</div>
			<h1 class="title">deadair<span class="nyc">.nyc</span></h1>
			<p class="tag">after-hours radio · loud, low &amp; in-between</p>
		</header>

		<Marquee
			text="✶ welcome to dead air ✶ turn it up, no one is awake ✶ loud guitars, soft static, songs for 3am ✶ no genre, just the feeling ✶ sign the shoutbox ✶"
		/>

		<div class="cols">
			<Sidebar />
			<main class="main">
				{@render children?.()}
				<Shoutbox />
			</main>
		</div>

		<footer class="foot">
			<span>deadair.nyc</span>
			<span class="dim">— best viewed at 1024×768, lights off —</span>
			<a class="by" href="https://anthonyderose.nyc" target="_blank" rel="noopener noreferrer"
				>by anthony ↗</a
			>
		</footer>
	</div>

	<Grain opacity={0.085} />
	<Scanlines />
</div>

<style>
	.page {
		position: relative;
		min-height: 100vh;
		padding: 0 0 40px;
		overflow: hidden;
	}

	.haze {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		pointer-events: none;
		z-index: 0;
		opacity: 0.32;
	}
	.h1 {
		top: -140px;
		left: 6%;
		width: 42vmin;
		height: 42vmin;
		background: radial-gradient(circle, rgba(158, 164, 178, 0.2), transparent 70%);
		animation: drift1 22s ease-in-out infinite;
	}
	.h2 {
		bottom: 4%;
		right: 5%;
		width: 48vmin;
		height: 48vmin;
		background: radial-gradient(circle, rgba(96, 108, 128, 0.2), transparent 70%);
		animation: drift2 28s ease-in-out infinite;
	}
	@keyframes drift1 {
		50% {
			transform: translate(6%, 8%) scale(1.12);
		}
	}
	@keyframes drift2 {
		50% {
			transform: translate(-7%, -5%) scale(1.1);
		}
	}

	.wrap {
		position: relative;
		z-index: 5;
		max-width: 940px;
		margin: 0 auto;
		padding: 0 16px;
	}

	.head {
		text-align: center;
		padding: 18px 0 10px;
	}
	.topline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 14px;
		color: var(--text-dim);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		padding-bottom: 6px;
		margin-bottom: 12px;
	}
	.topline b {
		color: var(--blood-bright);
	}
	.title {
		margin: 0;
		font-family: var(--font-goth);
		font-weight: 400;
		font-size: clamp(50px, 10vw, 104px);
		line-height: 0.82;
		color: var(--bone);
		text-transform: lowercase;
		letter-spacing: -0.01em;
		text-shadow:
			0 0 30px rgba(220, 224, 232, 0.26),
			0 3px 0 #000;
	}
	.nyc {
		color: var(--blood);
		text-shadow: 0 0 18px var(--blood-glow);
	}
	.tag {
		margin: 8px 0 14px;
		font-family: var(--font-stamp);
		color: var(--text-dim);
		font-size: 13px;
		letter-spacing: 0.02em;
	}

	.cols {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		margin-top: 14px;
	}
	.main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.foot {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-top: 26px;
		padding-top: 10px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--text-dim);
	}
	.foot .dim {
		color: var(--text-faint);
		font-style: italic;
	}
	.foot .by {
		color: var(--text-dim);
		text-decoration: none;
		transition: color 0.15s;
	}
	.foot .by:hover {
		color: var(--bone);
		text-decoration: none;
	}

	@media (max-width: 760px) {
		.cols {
			flex-direction: column;
		}
		.foot .dim {
			display: none;
		}
	}
</style>
