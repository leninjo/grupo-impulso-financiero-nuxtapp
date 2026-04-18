<template>
	<UModal v-model:open="isOpen" title="Registrar aporte">
		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
				@submit="handleSubmit"
			>
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

				<UFormField label="Boleta de pago" name="file">
					<UFileUpload
						color="neutral"
						highlight
						label="Arrastra o sube la boleta"
						description="PNG o JPG (max. 2MB)"
						class="w-full min-h-24"
						:multiple="false"
						@update:model-value="
							(val) => {
								state.file = val ?? undefined
							}
						"
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
		bank_id: z.string().min(1, 'Selecciona una entidad bancaria'),
		file: z
			.any()
			.refine((f) => f instanceof File, 'La boleta es requerida'),
	})

	type Schema = z.output<typeof schema>

	const state = reactive<{
		bank_id: string
		file?: File
	}>({
		bank_id: '',
		file: undefined as File | undefined,
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

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (!user) throw new Error('No autenticado')

			const today = new Date()
			const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

			const { data: payment, error: paymentError } = await supabase
				.from('payments')
				.insert({
					user_id: user.id,
					bank_id: event.data.bank_id,
					month,
				})
				.select()
				.single()

			if (paymentError || !payment) {
				throw new Error(paymentError?.message || 'Error creando aporte')
			}

			const fileExt = event.data.file.name.split('.').pop()
			const filePath = `tickets/${user.id}/${payment.id}.${fileExt}`

			const { error: uploadError } = await supabase.storage
				.from('grupo-impulso-files')
				.upload(filePath, event.data.file, {
					upsert: false,
				})

			if (uploadError) {
				throw new Error(
					uploadError?.message || 'Error cargando archivo',
				)
			}

			const { error: receiptError } = await supabase
				.from('payment_receipts')
				.insert({
					payment_id: payment.id,
					file_path: filePath,
				})

			if (receiptError) {
				throw new Error(
					receiptError?.message || 'Error al guardar archivo',
				)
			}

			toast.add({
				title: 'Aporte registrado',
				description: 'Tu aporte fue registrado exitosamente',
				color: 'success',
			})

			isOpen.value = false
			emit('success')
		} catch (error: any) {
			toast.add({
				title: 'Error',
				description: getErrorMessage(error),
				color: 'error',
			})
		}

		loading.value = false
	}

	async function compressImage(file: File): Promise<File> {
		return new Promise((resolve) => {
			const img = new Image()
			const reader = new FileReader()

			reader.onload = (e) => {
				img.src = e.target?.result as string
			}

			img.onload = () => {
				const canvas = document.createElement('canvas')

				const MAX_WIDTH = 1200
				const scale = MAX_WIDTH / img.width

				canvas.width = MAX_WIDTH
				canvas.height = img.height * scale

				const ctx = canvas.getContext('2d')!
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

				canvas.toBlob(
					(blob) => {
						if (!blob) return
						resolve(
							new File([blob], file.name, { type: 'image/jpeg' }),
						)
					},
					'image/jpeg',
					0.7,
				)
			}

			reader.readAsDataURL(file)
		})
	}

	function getErrorMessage(error: any) {
		if (!error) return 'Error desconocido'

		if (typeof error === 'string') return error

		if (error.message) return error.message

		if (error.error_description) return error.error_description

		return 'Error inesperado'
	}
</script>