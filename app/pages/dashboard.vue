<script setup lang="ts">
definePageMeta({
	middleware: 'auth',
})
</script>

<template>
	<ClientOnly>
		<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
			<div class="w-full mx-auto px-4 py-4 sm:max-w-3/4 lg:max-w-1/2 sm:py-6 sm:px-6 flex flex-col gap-4">
				<Header />
				<PaymentAlert />
				<StatsCards />
				<PaymentList />
			</div>
		</div>
	</ClientOnly>
</template>
