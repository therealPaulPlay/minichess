<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<title>Minichess - Play 5x5 Fast Tactical Online Chess</title>

	<!-- Favicons & App Icons -->
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<meta name="theme-color" content="#404141" />
	<link rel="canonical" href="https://minichess.co" />

	<!-- Core SEO & Keywords -->
	<meta
		name="description"
		content="Fast online mini chess game. Play minimalist 5x5 variant chess on Minichess in real-time."
	/>
	<meta
		name="keywords"
		content="minichess, 5x5 chess, chess variant, gardner minichess, aise minichess, online chess, blitz chess, play chess online, tactical chess"
	/>
	<meta name="author" content="Minichess" />

	<!-- OpenGraph / Facebook -->
	<meta property="og:site_name" content="Minichess" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://minichess.co" />
	<meta property="og:title" content="Minichess - Play 5x5 Fast Tactical Online Chess" />
	<meta
		property="og:description"
		content="Fast online mini chess game. Play minimalist 5x5 variant chess on Minichess in real-time."
	/>
	<meta property="og:image" content="https://minichess.co/images/og-image.jpg" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://minichess.co" />
	<meta name="twitter:title" content="Minichess - Play 5x5 Fast Tactical Online Chess" />
	<meta
		name="twitter:description"
		content="Fast online mini chess game. Play minimalist 5x5 variant chess on Minichess in real-time."
	/>
	<meta name="twitter:image" content="https://minichess.co/images/og-image.jpg" />
</svelte:head>

{@render children()}
