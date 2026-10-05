export default defineEventHandler(async (event) => {
  return { user: await getCurrentUser(event) }
})
