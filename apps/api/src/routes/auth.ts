import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/db'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number and special character'),
  country: z.string(),
  currency: z.enum(['JMD', 'USD']).default('JMD'),
  twoFactorMethod: z.enum(['sms', 'email', 'authenticator']).default('sms')
})

const verifyTwoFactorSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
  method: z.enum(['sms', 'email', 'authenticator'])
})

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetCode: z.string().length(6),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number and special character')
})

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()
const generateToken = () => crypto.randomBytes(32).toString('hex')

const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/login
  app.post('/auth/login', async (req, reply) => {
    try {
      const data = loginSchema.parse(req.body)
      
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      })
      
      if (!user || !user.password_hash) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }
      
      const isPasswordValid = await bcrypt.compare(data.password, user.password_hash)
      if (!isPasswordValid) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }
      
      // Generate 2FA code
      const twoFactorCode = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          two_factor_code: twoFactorCode,
          two_factor_expires: expiresAt
        }
      })
      
      // In production, send SMS/email with twoFactorCode
      console.log(`2FA Code for ${user.email}: ${twoFactorCode}`)
      
      reply.send({ 
        success: true,
        requiresTwoFactor: true,
        userId: user.id,
        twoFactorMethod: user.two_factor_method || 'sms',
        message: `2FA code sent via ${user.two_factor_method || 'SMS'}`
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // POST /auth/verify-2fa
  app.post('/auth/verify-2fa', async (req, reply) => {
    try {
      const data = verifyTwoFactorSchema.parse(req.body)
      
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      })
      
      if (!user || !user.two_factor_code || !user.two_factor_expires) {
        return reply.code(401).send({ error: 'Invalid or expired 2FA code' })
      }
      
      if (new Date() > user.two_factor_expires) {
        return reply.code(401).send({ error: '2FA code has expired' })
      }
      
      if (user.two_factor_code !== data.code) {
        return reply.code(401).send({ error: 'Invalid 2FA code' })
      }
      
      // Clear 2FA code and generate session token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          two_factor_code: null,
          two_factor_expires: null,
          last_login: new Date()
        }
      })
      
      const token = generateToken()
      
      reply.send({ 
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          kycStatus: user.kyc_status
        }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // POST /auth/register  
  app.post('/auth/register', async (req, reply) => {
    try {
      const data = registerSchema.parse(req.body)
      
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      
      if (existingUser) {
        return reply.code(409).send({ error: 'User already exists' })
      }
      
      const passwordHash = await bcrypt.hash(data.password, 12)
      
      const user = await prisma.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          first_name: data.firstName,
          last_name: data.lastName,
          password_hash: passwordHash,
          country: data.country,
          preferred_currency: data.currency,
          two_factor_method: data.twoFactorMethod,
          kyc_status: 'pending',
          is_active: true
        }
      })
      
      // Generate email verification code
      const verificationCode = generateCode()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verification_code: verificationCode,
          email_verification_expires: expiresAt
        }
      })
      
      // In production, send verification email
      console.log(`Email verification code for ${user.email}: ${verificationCode}`)
      
      reply.code(201).send({
        success: true,
        message: 'User registered successfully. Please check your email for verification code.',
        userId: user.id,
        requiresEmailVerification: true
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // POST /auth/verify-email
  app.post('/auth/verify-email', async (req, reply) => {
    try {
      const { userId, code } = req.body as { userId: string, code: string }
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user || !user.email_verification_code || !user.email_verification_expires) {
        return reply.code(400).send({ error: 'Invalid or expired verification code' })
      }
      
      if (new Date() > user.email_verification_expires) {
        return reply.code(400).send({ error: 'Verification code has expired' })
      }
      
      if (user.email_verification_code !== code) {
        return reply.code(400).send({ error: 'Invalid verification code' })
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          email_verification_code: null,
          email_verification_expires: null
        }
      })
      
      reply.send({ 
        success: true,
        message: 'Email verified successfully'
      })
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // POST /auth/forgot-password
  app.post('/auth/forgot-password', async (req, reply) => {
    try {
      const data = forgotPasswordSchema.parse(req.body)
      
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      })
      
      if (!user) {
        // Don't reveal if email exists for security
        return reply.send({ 
          success: true,
          message: 'If an account with that email exists, a reset code has been sent.'
        })
      }
      
      const resetCode = generateCode()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_reset_code: resetCode,
          password_reset_expires: expiresAt
        }
      })
      
      // In production, send reset code via email/SMS
      console.log(`Password reset code for ${user.email}: ${resetCode}`)
      
      reply.send({ 
        success: true,
        message: 'If an account with that email exists, a reset code has been sent.'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // POST /auth/reset-password
  app.post('/auth/reset-password', async (req, reply) => {
    try {
      const data = resetPasswordSchema.parse(req.body)
      
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      })
      
      if (!user || !user.password_reset_code || !user.password_reset_expires) {
        return reply.code(400).send({ error: 'Invalid or expired reset code' })
      }
      
      if (new Date() > user.password_reset_expires) {
        return reply.code(400).send({ error: 'Reset code has expired' })
      }
      
      if (user.password_reset_code !== data.resetCode) {
        return reply.code(400).send({ error: 'Invalid reset code' })
      }
      
      const passwordHash = await bcrypt.hash(data.newPassword, 12)
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          password_reset_code: null,
          password_reset_expires: null
        }
      })
      
      reply.send({ 
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors })
      } else {
        reply.code(500).send({ error: 'Internal server error' })
      }
    }
  })

  // POST /auth/logout
  app.post('/auth/logout', async (req, reply) => {
    // In production, invalidate the JWT token
    reply.send({ 
      success: true,
      message: 'Logged out successfully'
    })
  })

  // GET /auth/me (protected route to get current user)
  app.get('/auth/me', async (req, reply) => {
    try {
      // In production, extract user ID from JWT token
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return reply.code(401).send({ error: 'No token provided' })
      }
      
      // Mock user lookup for testing
      const userId = token.replace('jwt-token-', '')
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid token' })
      }
      
      reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          country: user.country,
          currency: user.preferred_currency,
          kycStatus: user.kyc_status,
          emailVerified: user.email_verified,
          twoFactorMethod: user.two_factor_method
        }
      })
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' })
    }
  })
}

export default authRoutes