<script>
	let { size = 24, color = "currentColor", class: className = "", ...restProps } = $props();
</script>

<svg viewBox="28 28 44 44" width={size} height={size} fill={color} class={className} {...restProps}>
	<path
		d="M69.63,50.83l-4.87,15.43c-.61,1.92-2.75,3.49-4.77,3.49h-19.97c-2.02,0-4.16-1.57-4.77-3.49l-4.87-15.43c-4.23-13.38,1.32-17.2,12.32-8.5l2.45,1.94c2.67,2.11,7.04,2.11,9.72,0l2.45-1.94c11-8.71,16.55-4.88,12.32,8.5Z"
	/>
	<circle cx="50" cy="36.36" r="6.12" />
</svg>
