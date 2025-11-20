import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLinkSchema, generateRandomCode } from '@/lib/validation'
import { Prisma } from '@prisma/client'

// POST /api/links - Create a new short link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createLinkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { url, code: customCode } = validation.data

    // Generate code if not provided
    let code = customCode
    if (!code) {
      // Try up to 10 times to generate a unique code
      let attempts = 0
      while (attempts < 10) {
        code = generateRandomCode()
        const existing = await prisma.link.findUnique({ where: { code } })
        if (!existing) break
        attempts++
      }
      if (attempts === 10) {
        return NextResponse.json(
          { error: 'Failed to generate unique code. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Create link
    try {
      const link = await prisma.link.create({
        data: {
          code: code!,
          url,
        },
      })

      return NextResponse.json(
        {
          id: link.id,
          code: link.code,
          url: link.url,
          clicks: link.clicks,
          createdAt: link.createdAt.toISOString(),
          lastClicked: link.lastClicked?.toISOString() || null,
        },
        { status: 201 }
      )
    } catch (error) {
      // Check for unique constraint violation
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'Code already exists. Please choose a different code.' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/links - List all links
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      links.map((link) => ({
        id: link.id,
        code: link.code,
        url: link.url,
        clicks: link.clicks,
        createdAt: link.createdAt.toISOString(),
        lastClicked: link.lastClicked?.toISOString() || null,
      }))
    )
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
