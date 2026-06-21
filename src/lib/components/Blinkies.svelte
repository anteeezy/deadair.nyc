<script lang="ts">
	// 88x31 web buttons. The currency of the 2005 web.
	const buttons = [
		{ t: 'DEFTONES', s: 'fan 4 life', c: 'blood' },
		{ t: 'SHOEGAZE', s: 'stare at shoes', c: 'steel' },
		{ t: 'NO PIX PLZ', s: 'JUST VIBES', c: 'blood' },
		{ t: 'IE6', s: 'optimized', c: 'steel' },
		{ t: 'RIP', s: 'myspace tom', c: 'blood' },
		{ t: 'TAPE TRADED', s: 'lo-fi 4ever', c: 'steel' }
	];
</script>

<div class="blinkies">
	{#each buttons as b}
		<span class="blinkie {b.c}">
			<strong>{b.t}</strong>
			<em>{b.s}</em>
		</span>
	{/each}
</div>

<style>
	.blinkies {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px;
	}
	.blinkie {
		width: 88px;
		height: 31px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		line-height: 1;
		border: 1px solid #000;
		outline: 1px solid #2a2a2a;
		font-family: Tahoma, sans-serif;
		text-align: center;
		overflow: hidden;
		animation: blink 1.1s steps(2) infinite;
	}
	.blinkie strong {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #fff;
		text-shadow: 0 1px 0 #000;
	}
	.blinkie em {
		font-size: 7px;
		font-style: normal;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.blinkie.blood {
		background: linear-gradient(180deg, #20202a, #4a4a54 50%, #121218);
	}
	.blinkie.blood em {
		color: #c6c6cc;
	}
	.blinkie.steel {
		background: linear-gradient(180deg, #2c2c30, #101012 50%, #050505);
	}
	.blinkie.steel em {
		color: #9a9aa0;
	}
	.blinkie:nth-child(2n) {
		animation-delay: 0.4s;
	}
	@keyframes blink {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.5);
		}
	}
</style>
