export const useStatsStore = defineStore('stats', () => {
	const supabase = useSupabaseClient()
	const monthlyTotal = ref(0)
	const historicalTotal = ref(0)
	const monthlyCount = ref(0)

	const today = new Date()
	const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
	const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
	const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`

	async function fetchStats() {
		const { data: amountData } = await supabase
			.from('payment_amounts')
			.select('amount')
			.lte('effective_from', currentMonth)
			.order('effective_from', { ascending: false })
			.limit(1)
			.single()

		const amount = amountData?.amount ?? 300

		const { data: monthPayments } = await supabase
			.from('payments')
			.select('id')
			.gte('month', currentMonth)
			.lt('month', nextMonth)

		monthlyCount.value = monthPayments?.length ?? 0
		monthlyTotal.value = monthlyCount.value * amount

		const { data: baseSetting } = await supabase
			.from('app_settings')
			.select('value')
			.eq('id' as any, 'base_total')
			.single()

		const base = Number(baseSetting?.value ?? 0)

		const { data: allPayments } = await supabase
			.from('payments')
			.select('id')

		historicalTotal.value = base + (allPayments?.length ?? 0) * amount
	}

	void fetchStats()

	return { monthlyTotal, historicalTotal, monthlyCount, fetchStats }
})
