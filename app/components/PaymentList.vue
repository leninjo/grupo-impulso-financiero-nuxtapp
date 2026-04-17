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
			<UIcon name="i-lucide-loader-circle" class="animate-spin text-2xl" />
		</div>

		<div v-else-if="payments.length === 0" class="text-center text-lg py-12 text-gray-400">
			No hay aportes registrados este mes
		</div>

		<div v-else class="flex flex-col gap-3">
			<UCard v-for="payment in payments" :key="payment.id" class="w-full" :ui="{ body: '!p-4' }">
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<span class="font-semibold text-lg">{{ payment.full_name }}</span>
						<span class="text-sm">{{ payment.bank }} → <span class="font-semibold">{{ payment.ticket_number }}</span></span>
					</div>
					<div class="flex flex-col items-end">
						<UBadge color="info" variant="subtle">Q {{ payment.amount.toLocaleString('es-GT') }}</UBadge>
						<span class="text-s">{{ payment.formatted_date }}</span>
					</div>
				</div>
			</UCard>
		</div>
	</div>
</template>

<script setup lang="ts">
const store = usePaymentsStore()
const { payments, loading } = storeToRefs(store)
</script>