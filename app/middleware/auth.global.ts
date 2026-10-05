const protectedRoutes = ['/dashboard', '/accounts', '/transactions', '/categories', '/reports']
const guestRoutes = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const isProtected = protectedRoutes.some((route) => to.path.startsWith(route))
  const isGuest = guestRoutes.includes(to.path)

  if (!isProtected && !isGuest) return

  const { data } = await useFetch('/api/auth/me', {
    key: 'current-user',
    credentials: 'include'
  })
  const user = data.value?.user

  if (isProtected && !user) return navigateTo('/login')
  if (isGuest && user) return navigateTo('/dashboard')
})
