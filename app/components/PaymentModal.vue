<template>
	<UModal v-model:open="isOpen" title="Registrar aporte">
		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
				@submit="handleSubmit"
			>
				<UFormField label="Número de boleta" name="ticket_number">
					<UInput
						v-model="state.ticket_number"
						placeholder="123456789"
						class="w-full"
					/>
				</UFormField>

				<UFormField label="Entidad bancaria" name="bank_id">
					<USelectMenu
						v-model="state.bank_id"
						:items="banks"
						value-key="id"
						label-key="name"
						placeholder="Selecciona un banco"
                        :search-input="{ placeholder: 'Buscar...' }"
						class="w-full"
					/>
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
						label="Registrar aporte"
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
const emit = defineEmits(['success'])

const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
	ticket_number: z.string().min(1, 'El número de boleta es requerido'),
	bank_id: z.string().min(1, 'Selecciona una entidad bancaria'),
})

type Schema = z.output<typeof schema>

const state = reactive({
	ticket_number: '',
	bank_id: '',
})

const { data: banks } = await useAsyncData('banks', async () => {
	const { data } = await supabase
		.from('banks')
		.select('id, name')
		.order('name')
	return data ?? []
})

async function handleSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return

	const today = new Date()
	const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

	const { error } = await supabase
		.from('payments')
		.insert({
			user_id: user.id,
			ticket_number: event.data.ticket_number,
			bank_id: event.data.bank_id,
			month,
		})

	if (error) {
		toast.add({
			title: 'Error al registrar',
			description: 'No se pudo registrar el aporte, intenta de nuevo',
			color: 'error',
		})
	} else {
		toast.add({
			title: 'Aporte registrado',
			description: 'Tu aporte fue registrado exitosamente',
			color: 'success',
		})
		isOpen.value = false
		emit('success')
	}

	loading.value = false
}
</script>