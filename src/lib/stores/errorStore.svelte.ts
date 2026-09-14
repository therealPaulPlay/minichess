import { goto } from "$app/navigation";
import type { ErrorModalOptions } from "$lib/engine/types";
import { multiplayerState } from "./multiplayerStore.svelte";

export const errorState = $state<{
	isOpen: boolean;
	title: string;
	message: string;
	actionText: string;
	onAction: () => void;
}>({
	isOpen: false,
	title: "",
	message: "",
	actionText: "Return to Home",
	onAction: () => {},
});

export function showError(options: ErrorModalOptions) {
	errorState.title = options.title;
	errorState.message = options.message;
	errorState.actionText = options.actionText ?? "Return to Home";
	errorState.onAction =
		options.onAction ??
		(() => {
			if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
			errorState.isOpen = false;
			goto("/");
		});
	errorState.isOpen = true;
}

export function closeError() {
	errorState.isOpen = false;
}
