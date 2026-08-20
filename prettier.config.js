/** @type {import("prettier").Config} */
export default {
	useTabs: true,
	singleAttributePerLine: false,
	printWidth: 120,
	plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	overrides: [
		{
			files: "*.svelte",
			options: {
				parser: "svelte",
			},
		},
		{
			files: ["*.svelte.ts", "*.ts"],
			options: {
				parser: "typescript",
			},
		},
		{
			files: ["*.svelte.js", "*.js"],
			options: {
				parser: "babel",
			},
		},
	],
};