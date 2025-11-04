// Simple in-memory cookie store keyed by user id
// Note: suitable for dev/single-instance deployments

const cookieStore = new Map<string, string>()

export function setUserCookies(userId: string, cookieHeader: string) {
  cookieStore.set(userId, cookieHeader)
}

export function getUserCookies(userId: string): string | undefined {
  return cookieStore.get(userId)
}

export function clearUserCookies(userId: string) {
  cookieStore.delete(userId)
}


