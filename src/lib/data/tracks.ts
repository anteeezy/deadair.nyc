// ─────────────────────────────────────────────────────────────────────────
// deadair.nyc — CHANNELS
//
// deadair is a LIVE feed: each channel plays a continuous program. Listeners
// join mid-stream based on wall-clock time, so everyone on a channel hears the
// same thing — you can't pick or scrub tracks, only tune between channels.
//
// Channel kinds:
//   'tracks'     — self-hosted files in static/audio/ (each track needs `duration`)
//   'soundcloud' — streams an official SoundCloud set via the Widget API (`scUrl`)
//   'static'     — generated dead-air noise (no program)
// ─────────────────────────────────────────────────────────────────────────

export interface Track {
	id: string;
	title: string;
	artist: string;
	/** path under static/, e.g. "audio/track.mp3" */
	src: string;
	/** length in seconds — required for the live schedule */
	duration: number;
	cover?: string;
}

export interface Channel {
	id: string;
	name: string;
	tagline: string;
	/** false = off air / coming soon (silent snow, no program) */
	live: boolean;
	kind?: 'tracks' | 'static' | 'soundcloud';
	/** SoundCloud set/playlist URL (kind: 'soundcloud') */
	scUrl?: string;
	tracks: Track[];
}

export const channels: Channel[] = [
	{
		id: 'aroundthefur',
		name: 'around the fur',
		tagline: 'deftones · 1997',
		live: true,
		kind: 'soundcloud',
		scUrl: 'https://soundcloud.com/deftones_official/sets/around-the-fur-1',
		tracks: []
	},
	{ id: 'static', name: 'dead air', tagline: 'just static · always on', live: true, kind: 'static', tracks: [] }
	// add more channels here later
];
