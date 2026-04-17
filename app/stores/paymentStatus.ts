export const usePaymentStatusStore = defineStore('paymentStatus', () => {
	const supabase = useSupabaseClient()
	const hasPaid = ref(false)
	const currentAmount = ref(300)
	const loading = ref(true)

	const today = new Date()
	const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
	const isPaymentPeriod = computed(() => today.getDate() <= 8)

	function getNextMonth(monthStr: string) {
		const parts = monthStr.split('-').map(Number)
		const year = parts[0] ?? today.getFullYear()
		const month = parts[1] ?? today.getMonth() + 1
		const nextYear = month === 12 ? year + 1 : year
		const nextMonth = month === 12 ? 1 : month + 1
		return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
	}

	async function checkStatus() {
		loading.value = true
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return

		const { data: payment } = await supabase
			.from('payments')
			.select('id')
			.eq('user_id', user.id)
			.gte('month', currentMonth)
			.lt('month', getNextMonth(currentMonth))
			.maybeSingle()

		hasPaid.value = !!payment

		const { data: amountData } = await supabase
			.from('payment_amounts')
			.select('amount')
			.lte('effective_from', currentMonth)
			.order('effective_from', { ascending: false })
			.limit(1)
			.single()

		if (amountData) currentAmount.value = amountData.amount
		loading.value = false
	}

	void checkStatus()

	return { hasPaid, currentAmount, isPaymentPeriod, loading, checkStatus }
})
