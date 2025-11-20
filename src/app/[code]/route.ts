import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidCode } from '@/lib/validation'

// GET /:code - Redirect to target URL
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params

  // Validate code format
  if (!isValidCode(code)) {
    return NextResponse.json(
      { error: 'Invalid code format' },
      { status: 404 }
    )
  }

  try {
    // Atomically increment clicks and update last_clicked
    const link = await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    })

    // Perform 302 redirect
    return NextResponse.redirect(link.url, { status: 302 })
  } catch (error) {
    // Link not found
    return NextResponse.json(
      { error: 'Link not found' },
      { status: 404 }
    )
  }
}
