import { browser } from "$app/environment";

export const SOUNDS = {
	move: "/sounds/piece-move.wav",
	capture: "/sounds/piece-capture.wav",
} as const;

export type SoundName = keyof typeof SOUNDS;

// Cache instantiated Audio objects on the client to avoid network latency
const audioCache = new Map<SoundName, HTMLAudioElement>();

function getAudio(name: SoundName): HTMLAudioElement | null {
	if (!browser) return null;

	if (!audioCache.has(name)) {
		const audio = new Audio(SOUNDS[name]);
		audio.preload = "auto";
		audioCache.set(name, audio);
	}

	return audioCache.get(name) ?? null;
}

export function playSound(name: SoundName, volume = 1) {
	if (!browser) return;

	const cached = getAudio(name);
	if (!cached) return;

	// cloneNode allows the sound to overlap with itself during rapid clicks
	const clone = cached.cloneNode() as HTMLAudioElement;
	clone.volume = Math.min(Math.max(volume, 0), 1);
	clone.play().catch((err) => {
		console.warn(`Could not play sound "${name}":`, err);
	});
}
