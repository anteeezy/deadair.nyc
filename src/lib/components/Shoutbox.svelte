<script lang="ts">
	interface Shout {
		user: string;
		body: string;
		c: string;
	}
	const seed: Shout[] = [
		{ user: 'xX_voidwalker_Xx', body: 'this is the only station that gets it', c: '#c98a90' },
		{ user: 'mariana_trench', body: 'play more slowdive pls 🥀', c: '#9a9aff' },
		{ user: 'ghost_in_amp', body: 'left this on all night. didnt sleep. worth it', c: '#8fd18f' },
		{ user: 'deftonesgirl97', body: 'the static between songs >>>', c: '#e0a0a8' },
		{ user: 'no_signal', body: 'where is everybody. its 3am', c: '#9a9aa0' }
	];

	let shouts = $state<Shout[]>(seed);
	let draft = $state('');
	let box: HTMLDivElement;

	function send(e: Event) {
		e.preventDefault();
		const body = draft.trim();
		if (!body) return;
		shouts = [...shouts, { user: 'you', body, c: '#ededf0' }];
		draft = '';
		queueMicrotask(() => box?.scrollTo({ top: box.scrollHeight }));
	}
</script>

<div class="module shoutbox">
	<div class="bar">
		<span>shoutbox</span>
		<span class="ct">{shouts.length} shouts</span>
	</div>

	<div class="log" bind:this={box}>
		{#each shouts as s}
			<div class="shout">
				<span class="u" style="color: {s.c}">{s.user}:</span>
				<span class="b">{s.body}</span>
			</div>
		{/each}
	</div>

	<form class="compose" onsubmit={send}>
		<input
			bind:value={draft}
			maxlength="140"
			placeholder="leave a shout..."
			aria-label="shoutbox message"
		/>
		<button type="submit">post</button>
	</form>
</div>

<style>
	.shoutbox {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.ct {
		font-size: 10px;
		opacity: 0.8;
	}
	.log {
		flex: 1;
		min-height: 120px;
		max-height: 200px;
		overflow-y: auto;
		padding: 6px 8px;
		background: #000;
		box-shadow: inset 1px 1px 0 var(--bevel-dark);
	}
	.shout {
		font-size: 12px;
		line-height: 1.45;
		padding: 1px 0;
		border-bottom: 1px dotted #16161c;
		word-break: break-word;
	}
	.u {
		font-weight: 700;
	}
	.b {
		color: var(--text);
	}

	.compose {
		display: flex;
		gap: 4px;
		padding: 6px;
		border-top: 1px solid #000;
		background: linear-gradient(180deg, #141418, #0a0a0d);
	}
	.compose input {
		flex: 1;
		min-width: 0;
		padding: 4px 6px;
		font-family: var(--font-body);
		font-size: 12px;
		color: var(--bone);
		background: #000;
		border: 1px solid #000;
		box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.8), inset 0 0 0 1px #16161c;
	}
	.compose input::placeholder {
		color: var(--text-faint);
	}
	.compose input:focus {
		outline: none;
		box-shadow: inset 0 0 0 1px var(--blood);
	}
	.compose button {
		padding: 4px 12px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fff;
		background: linear-gradient(180deg, var(--blood-bright), var(--blood-dim));
		border: 1px solid #000;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
	}
	.compose button:hover {
		filter: brightness(1.15);
	}
	.compose button:active {
		filter: brightness(0.85);
	}
</style>
