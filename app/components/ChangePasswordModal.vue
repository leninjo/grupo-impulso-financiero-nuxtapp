<template>
	<UModal v-model:open="isOpen" title="Cambiar contraseña">
		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
				@submit="handleSubmit"
			>
				<UFormField label="Contraseña actual" name="current_password">
					<UInput
						v-model="state.current_password"
						:type="showCurrent ? 'text' : 'password'"
						placeholder="••••••••"
						class="w-full"
						:ui="{ trailing: 'pe-1' }"
					>
						<template #trailing>
							<UButton
								color="neutral"
								variant="link"
								size="sm"
								:icon="showCurrent ? 'i-lucide-eye-off' : 'i-lucide-eye'"
								@click="showCurrent = !showCurrent"
							/>
						</template>
					</UInput>
				</UFormField>

				<UFormField label="Nueva contraseña" name="new_password">
					<UInput
						v-model="state.new_password"
						:type="showNew ? 'text' : 'password'"
						placeholder="••••••••"
						class="w-full"
						:ui="{ trailing: 'pe-1' }"
					>
						<template #trailing>
							<UButton
								color="neutral"
								variant="link"
								size="sm"
								:icon="showNew ? 'i-lucide-eye-off' : 'i-lucide-eye'"
								@click="showNew = !showNew"
							/>
						</template>
					</UInput>
				</UFormField>

				<UFormField label="Confirmar nueva contraseña" name="confirm_password">
					<UInput
						v-model="state.confirm_password"
						:type="showConfirm ? 'text' : 'password'"
						placeholder="••••••••"
						class="w-full"
						:ui="{ trailing: 'pe-1' }"
					>
						<template #trailing>
							<UButton
								color="neutral"
								variant="link"
								size="sm"
								:icon="showConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
								@click="showConfirm = !showConfirm"
							/>
						</template>
					</UInput>
				</UFormField>

				<div class="flex justify-end gap-2 pt-2">
					<UButton
						color="neutral"
						variant="ghost"
						label="Cancelar"
						@click="isOpen = false"
					/>
					<UButton
						type="submit"
						label="Cambiar contraseña"
						:loading="loading"
					/>
				</div>
			</UForm>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'

import type { FormSubmitEvent } from '@nuxt/ui'

const isOpen = defineModel<boolean>('open', { required: true })

const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(false)

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const schema = z.object({
	current_password: z.string().min(1, 'Ingresa tu contraseña actual'),
	new_password: z.string().min(6, 'Mínimo 6 caracteres'),
	confirm_password: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine(
	(data) => data.new_password === data.confirm_password,
	{
		message: 'Las contraseñas no coinciden',
		path: ['confirm_password'],
	}
)

type Schema = z.output<typeof schema>

const state = reactive({
	current_password: '',
	new_password: '',
	confirm_password: '',
})

function resetForm() {
	state.current_password = ''
	state.new_password = ''
	state.confirm_password = ''
}

async function handleSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true

	const { data: { user } } = await supabase.auth.getUser()
	if (!user?.email) return

	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: event.data.current_password,
	})

	if (signInError) {
		toast.add({
			title: 'Contraseña incorrecta',
			description: 'La contraseña actual no es correcta',
			color: 'error',
		})
		loading.value = false
		return
	}

	const { error: updateError } = await supabase.auth.updateUser({
		password: event.data.new_password,
	})

	if (updateError) {
		toast.add({
			title: 'Error al actualizar',
			description: 'No se pudo cambiar la contraseña, intenta de nuevo',
			color: 'error',
		})
	} else {
		toast.add({
			title: 'Contraseña actualizada',
			description: 'Tu contraseña fue cambiada exitosamente',
			color: 'success',
		})
		resetForm()
		isOpen.value = false
	}

	loading.value = false
}
</script>