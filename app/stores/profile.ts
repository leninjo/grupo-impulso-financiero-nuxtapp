export const useProfileStore = defineStore('profile', () => {
	const supabase = useSupabaseClient()

	const profile = ref<{ full_name: string } | null>(null)

	const fullName = computed(() => profile.value?.full_name ?? 'Usuario')

	const initials = computed(() =>
		fullName.value
			.split(' ')
			.map((word: string) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2),
	)

	async function fetchProfile() {
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return

		const { data } = await supabase
			.from('profiles')
			.select('full_name')
			.eq('id', user.id)
			.single()

		profile.value = data
	}

	void fetchProfile()

	return { profile, fullName, initials, fetchProfile }
})
