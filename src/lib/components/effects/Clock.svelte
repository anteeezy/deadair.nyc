<script lang="ts">
	// Live date + time readout, e.g. "SAT 20 JUN" / "21:52".
	// Y2K media-player corner clock. Updates once per second.
	const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	const MONTHS = [
		'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
		'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
	];

	let now = $state(new Date());

	$effect(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const pad = (n: number) => String(n).padStart(2, '0');

	let dateStr = $derived(
		`${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]}`
	);
	let timeStr = $derived(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
	// colon blinks on the half-second cadence of the seconds tick
	let blink = $derived(now.getSeconds() % 2 === 0);
</script>

<div class="clock">
	<span class="date">{dateStr}</span>
	<span class="sep" aria-hidden="true">·</span>
	<span class="time">
		{timeStr.slice(0, 2)}<span class="colon" class:dim={!blink}>:</span>{timeStr.slice(3)}
	</span>
</div>

<style>
	.clock {
		font-family: var(--font-mono);
		font-size: 1.4rem;
		line-height: 1;
		color: var(--text-dim);
		letter-spacing: 0.06em;
		display: inline-flex;
		align-items: baseline;
		gap: 0.6em;
		user-select: none;
		text-shadow: 0 0 6px rgba(232, 234, 240, 0.2);
	}
	.time {
		color: var(--text);
	}
	.colon {
		transition: opacity 0.15s linear;
	}
	.colon.dim {
		opacity: 0.25;
	}
	.sep {
		color: var(--text-faint);
	}
</style>
