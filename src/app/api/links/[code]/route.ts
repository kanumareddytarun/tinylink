import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidCode } from '@/lib/validation'

// GET /api/links/:code - Get stats for a single link
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params

  // Validate code format
  if (!isValidCode(code)) {
    return NextResponse.json(
      { error: 'Invalid code format' },
      { status: 400 }
    )
  }

  try {
    const link = await prisma.link.findUnique({
      where: { code },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: link.id,
      code: link.code,
      url: link.url,
      clicks: link.clicks,
      createdAt: link.createdAt.toISOString(),
      lastClicked: link.lastClicked?.toISOString() || null,
    })
  } catch (error) {
    console.error('Error fetching link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/links/:code - Delete a link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params

  // Validate code format
  if (!isValidCode(code)) {
    return NextResponse.json(
      { error: 'Invalid code format' },
      { status: 400 }
    )
  }

  try {
    await prisma.link.delete({
      where: { code },
    })

    return NextResponse.json(
      { message: 'Link deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Link not found' },
      { status: 404 }
    )
  }
}
