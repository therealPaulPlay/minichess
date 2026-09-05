<script lang="ts">
	import type { PieceType, PieceColor } from "../../engine/types";

	import PawnIcon from "$lib/components/chess-pieces/PawnIcon.svelte";
	import QueenIcon from "$lib/components/chess-pieces/QueenIcon.svelte";
	import RookIcon from "$lib/components/chess-pieces/RookIcon.svelte";
	import BishopIcon from "$lib/components/chess-pieces/BishopIcon.svelte";
	import KnightIcon from "$lib/components/chess-pieces/KnightIcon.svelte";
	import KingIcon from "$lib/components/chess-pieces/KingIcon.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Component } from "svelte";
	import ImpactDust from "$lib/components/effects/ImpactDust.svelte";

	let {
		type,
		color,
		draggable = false,
		class: className = "",
		triggerEffect = 0,
		isUnderAttack = false,
		...props
	}: {
		type: PieceType;
		color: PieceColor;
		draggable?: boolean;
		class?: string;
		triggerEffect?: number;
		isUnderAttack?: boolean;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const iconMap: Record<PieceType, Component> = {
		p: PawnIcon,
		n: KnightIcon,
		b: BishopIcon,
		r: RookIcon,
		q: QueenIcon,
		k: KingIcon,
	};

	const Icon = $derived(iconMap[type]);
</script>

<div
	class={[
		"z-20 flex h-full w-full items-center justify-center self-center overflow-visible",
		color === "white" ? "text-(--chess-piece-light)" : "text-black",
		className,
	]}
	class:tilt-n-move-shaking={isUnderAttack}
	{...props}
>
	{#if Icon}
		<Icon class="my-2 h-full w-full overflow-visible p-3 {draggable ? 'hover:cursor-grab' : ''}" />
	{/if}

	<!-- Impact dust -->
	<div class="pointer-events-none absolute bottom-3 flex items-center justify-center">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		<div class="-scale-x-100">
			<ImpactDust trigger={triggerEffect} {color} />
		</div>
		<div class="">
			<ImpactDust trigger={triggerEffect} {color} />
		</div>
	</div>
</div>

<style>
	.tilt-n-move-shaking {
		animation: tilt-n-move-shaking 0.25s ease-in infinite;
	}

	@keyframes tilt-n-move-shaking {
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		25% {
			transform: translate(1px, 1px) rotate(3deg);
		}
		50% {
			transform: translate(0, 0) rotate(0deg);
		}
		75% {
			transform: translate(-1px, 1px) rotate(-3deg);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
</style>
