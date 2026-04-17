// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	srcDir: 'app/',
	modules: [
		'@nuxt/ui',
		'@nuxtjs/supabase',
		'@nuxtjs/color-mode',
		'@pinia/nuxt',
		'@pinia/nuxt',
	],
	css: ['~/assets/css/main.css'],
	supabase: {
		redirect: false,
	},
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	vite: {
		optimizeDeps: {
			include: ['zod'],
		},
	},
})