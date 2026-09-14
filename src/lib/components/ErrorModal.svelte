<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { errorState } from "$lib/stores/errorStore.svelte";
	import { TriangleAlert } from "@lucide/svelte";
</script>

<AlertDialog.Root open={errorState.isOpen}>
	<AlertDialog.Content class="sm:max-w-md">
		<AlertDialog.Header>
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
					<TriangleAlert />
				</div>
				<AlertDialog.Title class="min-w-0 text-lg font-semibold wrap-break-word text-zinc-900">
					{errorState.title}
				</AlertDialog.Title>
			</div>
			<AlertDialog.Description
				class="max-h-[60vh] overflow-y-auto pt-2 text-left text-sm wrap-break-word text-zinc-600"
			>
				{errorState.message}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Action
				class="w-full cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800"
				onclick={errorState.onAction}
			>
				{errorState.actionText}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
