<script lang="ts">
	import { onMount } from 'svelte';
	import { sc } from '$lib/audio/soundcloud';
	import { channels } from '$lib/data/tracks';

	let iframe = $state<HTMLIFrameElement>();
	const scChannel = channels.find((c) => c.kind === 'soundcloud');

	const params = new URLSearchParams({
		url: scChannel?.scUrl ?? '',
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
	const src = `https://w.soundcloud.com/player/?${params.toString()}`;

	onMount(() => {
		if (scChannel && iframe) sc.attach(iframe);
	});
</script>

{#if scChannel}
	<iframe
		bind:this={iframe}
		title="soundcloud stream"
		{src}
		allow="autoplay; encrypted-media"
		scrolling="no"
		aria-hidden="true"
	></iframe>
{/if}

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
