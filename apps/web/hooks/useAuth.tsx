import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  country?: string
  currency?: string
  kycStatus: string
  emailVerified: boolean
  twoFactorMethod?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; requiresTwoFactor?: boolean; userId?: string; twoFactorMethod?: string; message?: string; error?: string }>
  verifyTwoFactor: (userId: string, code: string, method: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    country: string
    currency?: string
    twoFactorMethod?: string
  }) => Promise<{ success: boolean; userId?: string; requiresEmailVerification?: boolean; error?: string }>
  verifyEmail: (userId: string, code: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  useEffect(() => {
    // Check if user is already logged in on app load
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          localStorage.removeItem('authToken')
        }
      } else {
        localStorage.removeItem('authToken')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.requiresTwoFactor) {
          return {
            success: true,
            requiresTwoFactor: true,
            userId: data.userId,
            twoFactorMethod: data.twoFactorMethod,
            message: data.message
          }
        } else {
          // Direct login without 2FA
          localStorage.setItem('authToken', data.token)
          setUser(data.user)
          return { success: true }
        }
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const verifyTwoFactor = async (userId: string, code: string, method: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, code, method })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || '2FA verification failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    country: string
    currency?: string
    twoFactorMethod?: string
  }) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          userId: data.userId,
          requiresEmailVerification: data.requiresEmailVerification
        }
      } else {
        return {
          success: false,
          error: data.error || 'Registration failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const verifyEmail = async (userId: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, code })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Email verification failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Password reset request failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, resetCode, newPassword })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Password reset failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch(`${API_BASE}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('authToken')
      setUser(null)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    verifyTwoFactor,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}