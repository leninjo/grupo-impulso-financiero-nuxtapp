<template>
	<div class="min-h-screen flex items-center justify-center">
		<UCard class="w-full max-w-md mx-4">
			<template #header>
				<div class="w-full flex justify-center">
					<img
						src="/logo.png"
						alt="Impulso Financiero"
						class="h-16 w-auto dark:hidden"
					/>

					<img
						src="/logo-dark.png"
						alt="Impulso Financiero"
						class="h-16 w-auto hidden dark:block"
					/>
				</div>

				<h1 class="text-xl font-bold text-center">
					Grupo Impulso Financiero
				</h1>
			</template>

			<UForm
				@submit="handleLogin"
				class="flex flex-col gap-6"
				:state="state"
				:schema="schema"
			>
				<UFormField label="Correo" name="email">
					<UInput
						size="lg"
						v-model="state.email"
						type="email"
						placeholder="tu@correo.com"
						class="w-full"
					/>
				</UFormField>

				<UFormField label="Contraseña" name="password">
					<UInput
						size="lg"
						v-model="state.password"
						placeholder="Contraseña"
						:type="show ? 'text' : 'password'"
						:ui="{ trailing: 'pe-1' }"
						class="w-full"
					>
						<template #trailing>
							<UButton
								color="neutral"
								variant="link"
								size="sm"
								:icon="
									show ? 'i-lucide-eye-off' : 'i-lucide-eye'
								"
								:aria-label="show ? 'Ocultar' : 'Ver'"
								:aria-pressed="show"
								aria-controls="password"
								@click="show = !show"
							/>
						</template>
					</UInput>
				</UFormField>

				<UButton
					size="lg"
					type="submit"
					:loading="loading"
					class="w-full justify-center"
				>
					Iniciar sesión
				</UButton>
			</UForm>
		</UCard>
	</div>
</template>

<script setup lang="ts">
	import { z } from 'zod'

	import type { FormSubmitEvent } from '@nuxt/ui'

	const schema = z.object({
		email: z.email('Correo inválido'),
		password: z.string().min(1, 'Contraseña es requerida'),
	})

	type Schema = z.output<typeof schema>

	const state = reactive({
		email: '',
		password: '',
	})

	const supabase = useSupabaseClient()
	const user = useSupabaseUser()
	const toast = useToast()

	const show = ref(false)
	const errorMsg = ref('')
	const loading = ref(false)

	watchEffect(() => {
		if (user.value) navigateTo('/dashboard')
	})

	async function handleLogin(event: FormSubmitEvent<Schema>) {
		loading.value = true
		errorMsg.value = ''

		const { error } = await supabase.auth.signInWithPassword({
			email: event.data.email,
			password: event.data.password,
		})

		if (error) {
			toast.add({
				title: 'Error al iniciar sesión',
				description:
					error.status === 400
						? 'Correo o contraseña incorrectos'
						: 'Ocurrió un error, contacte con soporte',
				color: 'error',
			})
		} else {
			navigateTo('/dashboard')
		}

		loading.value = false
	}
</script>
