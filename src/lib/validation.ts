import { z } from 'zod'

// Code must be 6-8 alphanumeric characters as per spec
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/

// URL validation schema
export const createLinkSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return parsed.protocol === 'http:' || parsed.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: 'URL must be a valid HTTP or HTTPS URL' }
    ),
  code: z
    .string()
    .optional()
    .refine(
      (code) => {
        if (!code) return true // Optional field
        return CODE_REGEX.test(code)
      },
      { message: 'Custom code must be 6-8 alphanumeric characters' }
    ),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>

// Validate code format
export function isValidCode(code: string): boolean {
  return CODE_REGEX.test(code)
}

// Generate a random code
export function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = 6 + Math.floor(Math.random() * 3) // 6-8 characters
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
