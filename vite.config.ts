import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		host: true,
		proxy: {
			"/socket": {
				target: "http://localhost:3000",
				ws: true,
			},
		},
	},
	ssr: {
		noExternal: ["gifenc", "svelte-sonner"],
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
		}),
	],
});
