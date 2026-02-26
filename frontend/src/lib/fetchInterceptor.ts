/**
 * Global API Fetch Wrapper
 * Intercepts outbound requests and catches 401 Unauthorized responses
 * automatically logging the user out when their token expires.
 */
import { useAuthStore } from '@/store'

export async function customFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  // Intercept 401 Unauthorized globally across all API hits
  if (response.status === 401) {
    const authStore = useAuthStore.getState()
    
    // Check if we are already dealing with an authenticated user before violently booting them
    // This prevents endless loops on public pages checking sessions
    if (authStore.token) {
      console.warn('Session expired. Intercepted 401. Logging out...')
      authStore.logout()
      
      // Force Hard Redirect to Login Page
      window.location.href = '/login'
    }
  }

  return response
}
