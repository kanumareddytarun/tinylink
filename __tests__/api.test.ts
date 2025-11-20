import { prisma } from '@/lib/prisma'

// Mock data
const testLink = {
  code: 'test123',
  url: 'https://example.com/test',
}

describe('TinyLink API Tests', () => {
  // Clean up test data before and after tests
  beforeAll(async () => {
    await prisma.link.deleteMany({
      where: { code: { startsWith: 'test' } },
    })
  })

  afterAll(async () => {
    await prisma.link.deleteMany({
      where: { code: { startsWith: 'test' } },
    })
    await prisma.$disconnect()
  })

  describe('GET /healthz', () => {
    it('should return 200 with correct response', async () => {
      const response = await fetch('http://localhost:3000/healthz')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true, version: '1.0' })
    })
  })

  describe('POST /api/links', () => {
    it('should create a new link', async () => {
      const response = await fetch('http://localhost:3000/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLink),
      })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.code).toBe(testLink.code)
      expect(data.url).toBe(testLink.url)
      expect(data.clicks).toBe(0)
    })

    it('should return 409 for duplicate code', async () => {
      const response = await fetch('http://localhost:3000/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLink),
      })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    it('should reject invalid URL', async () => {
      const response = await fetch('http://localhost:3000/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'not-a-valid-url', code: 'test456' }),
      })

      expect(response.status).toBe(400)
    })

    it('should reject invalid code format', async () => {
      const response = await fetch('http://localhost:3000/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com', code: '12' }), // Too short
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/links', () => {
    it('should list all links', async () => {
      const response = await fetch('http://localhost:3000/api/links')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/links/:code', () => {
    it('should return stats for a specific link', async () => {
      const response = await fetch(`http://localhost:3000/api/links/${testLink.code}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toBe(testLink.code)
      expect(data.url).toBe(testLink.url)
    })

    it('should return 404 for non-existent link', async () => {
      const response = await fetch('http://localhost:3000/api/links/notfound')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /:code (Redirect)', () => {
    it('should redirect and increment clicks', async () => {
      // Get initial click count
      const statsResponse = await fetch(`http://localhost:3000/api/links/${testLink.code}`)
      const initialStats = await statsResponse.json()
      const initialClicks = initialStats.clicks

      // Perform redirect (with redirect: 'manual' to check status)
      const response = await fetch(`http://localhost:3000/${testLink.code}`, {
        redirect: 'manual',
      })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(testLink.url)

      // Verify click count increased
      await new Promise((resolve) => setTimeout(resolve, 100)) // Wait for DB update
      const newStatsResponse = await fetch(`http://localhost:3000/api/links/${testLink.code}`)
      const newStats = await newStatsResponse.json()

      expect(newStats.clicks).toBe(initialClicks + 1)
      expect(newStats.lastClicked).not.toBeNull()
    })

    it('should return 404 for non-existent code', async () => {
      const response = await fetch('http://localhost:3000/notfound', {
        redirect: 'manual',
      })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/links/:code', () => {
    it('should delete a link', async () => {
      const response = await fetch(`http://localhost:3000/api/links/${testLink.code}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(200)

      // Verify link no longer exists
      const getResponse = await fetch(`http://localhost:3000/api/links/${testLink.code}`)
      expect(getResponse.status).toBe(404)

      // Verify redirect no longer works
      const redirectResponse = await fetch(`http://localhost:3000/${testLink.code}`, {
        redirect: 'manual',
      })
      expect(redirectResponse.status).toBe(404)
    })

    it('should return 404 when deleting non-existent link', async () => {
      const response = await fetch('http://localhost:3000/api/links/notfound', {
        method: 'DELETE',
      })

      expect(response.status).toBe(404)
    })
  })
})
