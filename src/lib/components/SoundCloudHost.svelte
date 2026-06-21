<script lang="ts">
	import { onMount } from 'svelte';
	import { sc, type SCSource } from '$lib/audio/soundcloud';
	import { channels } from '$lib/data/tracks';

	type Deck = { id: string; src: string; source: SCSource; idx: number };

	// one hidden player per SoundCloud channel, each preloaded with its start
	const decks: Deck[] = channels
		.filter((c) => c.kind === 'soundcloud' && (c.scTracks?.length || c.scUrl))
		.map((c) => {
			if (c.scTracks?.length) {
				// playlist: pick a wall-clock-ish starting track (~3.5-min assumed avg)
				const idx = Math.floor((Date.now() / (3.5 * 60 * 1000)) % c.scTracks.length);
				return { id: c.id, src: playerSrc(c.scTracks[idx]), source: { type: 'list', urls: c.scTracks }, idx };
			}
			return { id: c.id, src: playerSrc(c.scUrl ?? ''), source: { type: 'set', url: c.scUrl ?? '' }, idx: 0 };
		});

	function playerSrc(url: string): string {
		const params = new URLSearchParams({
			url,
			auto_play: 'false',
			buying: 'false',
			sharing: 'false',
			download: 'false',
			show_artwork: 'false',
			show_comments: 'false',
			show_playcount: 'false',
			show_user: 'false',
			hide_related: 'true',
			single_active: 'true',
			visual: 'false'
		});
		return `https://w.soundcloud.com/player/?${params.toString()}`;
	}

	let iframes: HTMLIFrameElement[] = $state([]);

	onMount(() => {
		decks.forEach((d, i) => {
			if (iframes[i]) sc.register(d.id, iframes[i], d.source, d.idx);
		});
	});
</script>

{#each decks as d, i (d.id)}
	<iframe
		bind:this={iframes[i]}
		title="soundcloud stream"
		src={d.src}
		allow="autoplay; encrypted-media"
		scrolling="no"
		aria-hidden="true"
	></iframe>
{/each}

<style>
	/* rendered at a normal size but parked off-screen — fully-hidden/zero-size
	   iframes can get their autoplay blocked by some browsers */
	iframe {
		position: fixed;
		left: -10000px;
		bottom: 0;
		width: 320px;
		height: 120px;
		border: 0;
		pointer-events: none;
	}
</style>
