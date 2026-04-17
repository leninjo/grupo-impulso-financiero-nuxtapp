<template>
	<div class="grid grid-cols-2 gap-2">
		<UCard :ui="{ body: '!p-4' }">
			<div class="flex flex-col gap-1">
				<span class="text-sm text-gray-400">Aportes este mes</span>
				<span class="text-2xl font-bold"
					>Q {{ monthlyTotal.toLocaleString('es-GT') }}</span
				>
			</div>
		</UCard>
		<UCard :ui="{ body: '!p-4' }">
			<div class="flex flex-col gap-1">
				<span class="text-sm text-gray-400">Total histórico</span>
				<span class="text-2xl font-bold"
					>Q {{ historicalTotal.toLocaleString('es-GT') }}</span
				>
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
	const statsStore = useStatsStore()
	const { monthlyTotal, historicalTotal, monthlyCount } =
		storeToRefs(statsStore)
</script>
