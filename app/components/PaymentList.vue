<template>
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h2 class="font-semibold text-xl">Aportes</h2>
			<USelectMenu
				v-model="store.selectedMonth"
				:items="store.monthOptions"
				:search-input="{ placeholder: 'Buscar...' }"
				label-key="label"
				class="w-48"
				@update:model-value="store.selectedMonth = $event"
			/>
		</div>

		<div v-if="loading" class="flex justify-center py-12">
			<UIcon
				name="i-lucide-loader-circle"
				class="animate-spin text-2xl"
			/>
		</div>

		<div
			v-else-if="payments.length === 0"
			class="text-center text-lg py-12 text-gray-400"
		>
			No hay aportes registrados este mes
		</div>

		<div v-else class="flex flex-col gap-3">
			<UCard
				v-for="payment in payments"
				:key="payment.id"
				class="w-full"
				:ui="{ body: '!p-4' }"
			>
				<div class="flex items-center justify-between">
					<div class="flex flex-col gap-1">
						<span class="font-semibold text-lg">{{
							payment.full_name
						}}</span>
						<UButton
							size="xs"
							class="justify-center"
							variant="subtle"
							label="Ver boleta"
							@click="openReceipt(payment.file_path)"
						/>
					</div>
					<div class="flex flex-col items-end">
						<UBadge color="primary" variant="subtle"
							>Q
							{{ payment.amount.toLocaleString('es-GT') }}</UBadge
						>
						<span class="text-s">{{ payment.formatted_date }}</span>
					</div>
				</div>
			</UCard>
		</div>
	</div>

	<UModal v-model:open="isOpen" title="Boleta">
		<template #body>
			<img
				v-if="selectedReceipt"
				:src="selectedReceipt"
				class="w-full rounded"
				alt=""
			/>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	const store = usePaymentsStore()
	const { payments, loading } = storeToRefs(store)

	const supabase = useSupabaseClient()

	const urlCache = new Map<string, string>()

	const selectedReceipt = ref<string | null>(null)
	const isOpen = ref(false)

	async function openReceipt(path: string) {
		if (urlCache.has(path)) {
			selectedReceipt.value = urlCache.get(path)!
			isOpen.value = true
			return
		}

		const { data, error } = await supabase.storage
			.from('grupo-impulso-files')
			.createSignedUrl(path, 60 * 5)

		if (error) throw error

		urlCache.set(path, data.signedUrl)
		selectedReceipt.value = data.signedUrl
		isOpen.value = true
	}
</script>