<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<!-- Assets served from /lib/assets are bundled by vite and given randomized names on each re-build, hence poor for google-indexability (only use for e.g. the favicon) -->
	<link rel="icon" href={favicon} />
	<!-- TODO: These images still need to be populated, including the manifest and og-image! -->
	<link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png" />
	<meta name="description" content="Fast online mini chess game. Play minimalist 5x5 variant chess on Minichess." />
	<meta property="og:title" content="Minichess" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="Fast online mini chess game. Play minimalist 5x5 variant chess on Minichess."
	/>
	<meta property="og:image" content="https://minichess.co/images/og-image.jpg" />
</svelte:head>

{@render children()}
