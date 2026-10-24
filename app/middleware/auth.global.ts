const protectedRoutes = ['/dashboard', '/accounts', '/transactions', '/groups', '/categories', '/reports', '/admin']
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
  if (to.path.startsWith('/admin') && !user?.isAdmin) return navigateTo('/dashboard')
  if (isGuest && user) return navigateTo('/dashboard')
})
