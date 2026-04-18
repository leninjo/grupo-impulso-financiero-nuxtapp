interface Payment {
	id: string
	created_at: string
	full_name: string
	bank: string
	formatted_date: string
	amount: number
	file_path: string
}

export const usePaymentsStore = defineStore('payments', () => {
	const supabase = useSupabaseClient()
	const payments = ref<Payment[]>([])
	const loading = ref(false)

	const monthOptions = Array.from({ length: 12 }, (_, i) => {
		const date = new Date()
		date.setMonth(date.getMonth() - i)
		return {
			label: date.toLocaleDateString('es-GT', {
				month: 'long',
				year: 'numeric',
			}),
			value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`,
		}
	})

	const selectedMonth = ref(monthOptions[0]!)

	const amountCache = new Map<string, number>()

	async function fetchCurrentAmount(monthValue: string) {
		if (amountCache.has(monthValue)) return amountCache.get(monthValue)!

		const { data } = await supabase
			.from('payment_amounts')
			.select('amount')
			.lte('effective_from', monthValue)
			.order('effective_from', { ascending: false })
			.limit(1)
			.single()

		const amount = data?.amount ?? 300
		amountCache.set(monthValue, amount)
		return amount
	}

	async function fetchPayments() {
		loading.value = true

		const amount = await fetchCurrentAmount(selectedMonth.value.value)

		const parts = selectedMonth.value.value.split('-').map(Number)
		const year = parts[0] ?? new Date().getFullYear()
		const month = parts[1] ?? new Date().getMonth() + 1
		const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
		const nextMonthYear = month === 12 ? year + 1 : year
		const nextMonthNum = month === 12 ? 1 : month + 1
		const lastDay = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-01`

		const { data } = await supabase
			.from('payments')
			.select(
				`
				id,
				created_at,
				profiles(full_name),
				banks(name),
				payment_receipts(file_path)
			`,
			)
			.gte('month', firstDay)
			.lt('month', lastDay)
			.not('payment_receipts', 'is', null)

		payments.value = (data ?? [])
			.filter((p: any) => p.payment_receipts?.length > 0)
			.map((p: any) => ({
				id: p.id,
				created_at: p.created_at,
				full_name: p.profiles?.full_name ?? 'Sin nombre',
				bank: p.banks?.name ?? 'Sin banco',
				file_path: p.payment_receipts[0].file_path,
				formatted_date: new Date(p.created_at).toLocaleString('es-GT', {
					timeZone: 'America/Guatemala',
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					hour12: true,
				}),
				amount,
			}))

		loading.value = false
	}

	function reset() {
		payments.value = []
	}

	watch(selectedMonth, fetchPayments, { immediate: true })

	return {
		payments,
		loading,
		monthOptions,
		selectedMonth,
		reset,
	}
})
