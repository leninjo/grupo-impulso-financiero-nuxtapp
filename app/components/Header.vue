<template>
	<header
		class="ring ring-gray-200 dark:ring-gray-800 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg"
	>
		<div class="flex items-center justify-between max-w-7xl mx-auto">
			<div class="flex items-center gap-2">
				<img
					src="/logo.png"
					alt="Impulso Financiero"
					class="h-10 w-auto dark:hidden"
				/>

				<img
					src="/logo-dark.png"
					alt="Impulso Financiero"
					class="h-10 w-auto hidden dark:block"
				/>
			</div>

			<div class="flex items-center gap-1">
				<UButton
					v-if="!hasPaid && isPaymentPeriod"
					label="Aporte"
					icon="i-lucide-plus"
					size="md"
					@click="isOpen = true"
				/>

				<UColorModeButton size="md" />

				<UDropdownMenu :items="menuItems">
					<UButton
						color="neutral"
						variant="ghost"
						size="md"
						trailing-icon="i-lucide-chevron-down"
					>
						<span class="lg:hidden">{{ initials }}</span>
						<span class="hidden lg:inline">{{ fullName }}</span>
					</UButton>
				</UDropdownMenu>
			</div>
		</div>

		<PaymentModal v-model:open="isOpen" @success="onPaymentSuccess" />
		<ChangePasswordModal v-model:open="isChangePasswordOpen" />
	</header>
</template>

<script setup lang="ts">
	const supabase = useSupabaseClient()

	const profileStore = useProfileStore()
	const { fullName, initials } = storeToRefs(profileStore)

	const { hasPaid, isPaymentPeriod, checkStatus } = usePaymentStatusStore()
	const isOpen = ref(false)

	const isChangePasswordOpen = ref(false)

	async function onPaymentSuccess() {
		await checkStatus()
	}

	const menuItems = [
		[
			{
				label: fullName.value,
				disabled: true,
			},
		],
		[
			{
				label: 'Cambiar contraseña',
				icon: 'i-lucide-key-round',
				onSelect: () => (isChangePasswordOpen.value = true),
			},
		],
		[
			{
				label: 'Cerrar sesión',
				icon: 'i-lucide-log-out',
				color: 'error' as const,
				onSelect: async () => {
					await supabase.auth.signOut()
					navigateTo('/')
				},
			},
		],
	]
</script>
