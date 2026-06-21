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
	/** a list of individual SoundCloud track URLs (kind: 'soundcloud') */
	scTracks?: string[];
	/** a single SoundCloud set/playlist URL (kind: 'soundcloud') */
	scUrl?: string;
	tracks: Track[];
}

// a hand-picked shoegaze playlist, streamed from SoundCloud (one track at a time)
const shoegazeSet: string[] = [
	'https://soundcloud.com/soundsbetterwithreverb/fleeting-joys-kiss-a-girl-in',
	'https://soundcloud.com/user-321750480/ozean-scenic',
	'https://soundcloud.com/miniatures/what-you-want-1',
	'https://soundcloud.com/bunni666/forgotten-fossilized-archaic',
	'https://soundcloud.com/savage-sister/huge-moves-master-prep',
	'https://soundcloud.com/unrealonline/blue-garden',
	'https://soundcloud.com/blankenberge/everything',
	'https://soundcloud.com/blankenberge/no-sense',
	'https://soundcloud.com/rew-fusca-music/outlanderr',
	'https://soundcloud.com/topographies/pink-thoughts',
	'https://soundcloud.com/daniel_romero-1/lost-in-your-gaze-1',
	'https://soundcloud.com/bloodhoundsonmytrail/shes-in-my-plans',
	'https://soundcloud.com/whirr-official/sandy',
	'https://soundcloud.com/saintmarie-records/sway-fall',
	'https://soundcloud.com/crybabybaby/repetitive-days',
	'https://soundcloud.com/lifeonvenusband/may',
	'https://soundcloud.com/tearsrunrings/tears-run-rings-mind-the-wires',
	'https://soundcloud.com/user-315472317/bumblebee',
	'https://soundcloud.com/gleemer/lily'
];

export const channels: Channel[] = [
	{
		id: 'shoegaze',
		name: 'shoegaze',
		tagline: 'wall of sound · all night',
		live: true,
		kind: 'soundcloud',
		scTracks: shoegazeSet,
		tracks: []
	},
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
