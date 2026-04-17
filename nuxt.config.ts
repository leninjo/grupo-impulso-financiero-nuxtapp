// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: 'Impulso Financiero',
		},
	},
	srcDir: 'app/',
	modules: [
		'@nuxt/ui',
		'@nuxtjs/supabase',
		'@nuxtjs/color-mode',
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
	ssr: false,
	nitro: {
		preset: 'vercel-static',
	},
})