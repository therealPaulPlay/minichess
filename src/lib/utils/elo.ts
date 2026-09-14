import { browser } from "$app/environment";

const STORAGE_KEY = "minichess_user_elo";
const DEFAULT_ELO = 1000;

export function getUserElo(): number {
	if (!browser) return DEFAULT_ELO;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? parseInt(stored, 10) : DEFAULT_ELO;
}

export function setUserElo(newElo: number): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, Math.max(100, Math.round(newElo)).toString());
}

export function calculateEloChange(playerElo: number, opponentElo: number, score: 1 | 0.5 | 0, k = 32): number {
	const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
	return Math.round(k * (score - expectedScore));
}
