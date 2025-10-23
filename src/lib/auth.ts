import { randomBytes } from 'crypto'
import { emailService } from './email'

// Mock data storage for development
const mockTokens = new Map<string, any>()
const mockUsers = new Map<string, any>()

interface SignInToken {
  token: string
  email: string
  expires: Date
}

export async function sendSignInToken(email: string, callbackUrl: string): Promise<void> {
  try {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Use mock storage for development
    mockTokens.set(token, {
      email,
      expires,
      used: false,
      createdAt: new Date(),
    })

    // Send magic link email (only if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      await emailService.sendMagicLink(email, token)
    } else {
      console.log(`Mock magic link for ${email}: ${process.env.NEXTAUTH_URL}/auth/callback?token=${token}`)
    }

    console.log(`Magic link sent to ${email}`)
  } catch (error) {
    console.error('Failed to send magic link:', error)
    throw new Error('Failed to send magic link')
  }
}

export async function verifySignInToken(token: string): Promise<{ email: string } | null> {
  try {
    // Use mock storage for development
    const tokenData = mockTokens.get(token)
    if (!tokenData) {
      return null
    }

    // Check if token is expired
    if (new Date() > tokenData.expires) {
      mockTokens.delete(token)
      return null
    }

    // Check if token is already used
    if (tokenData.used) {
      return null
    }

    // Mark token as used
    tokenData.used = true
    mockTokens.set(token, tokenData)

    return { email: tokenData.email }
  } catch (error) {
    console.error('Failed to verify sign in token:', error)
    return null
  }
}

export async function createOrUpdateUser(email: string, name?: string) {
  try {
    // Use mock storage for development
    const existingUser = mockUsers.get(email)
    if (existingUser) {
      existingUser.name = name || existingUser.name
      existingUser.updatedAt = new Date()
      mockUsers.set(email, existingUser)
    } else {
      mockUsers.set(email, {
        id: email,
        email,
        name: name || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return { id: email, email, name: name || '' }
  } catch (error) {
    console.error('Failed to create or update user:', error)
    throw new Error('Failed to create or update user')
  }
}

export async function getUserByEmail(email: string) {
  try {
    // Use mock storage for development
    const userData = mockUsers.get(email)
    if (!userData) {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }
  } catch (error) {
    console.error('Failed to get user by email:', error)
    return null
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    // This would typically be done with a scheduled function
    // For now, we'll just log that cleanup should be implemented
    console.log('Token cleanup should be implemented with a scheduled function')
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error)
  }
}
