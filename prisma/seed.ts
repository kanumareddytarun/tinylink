import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create some sample links
  const sampleLinks = [
    {
      code: 'google',
      url: 'https://www.google.com',
      clicks: 42,
      lastClicked: new Date('2024-01-15T10:30:00Z'),
    },
    {
      code: 'github',
      url: 'https://github.com',
      clicks: 18,
      lastClicked: new Date('2024-01-16T14:20:00Z'),
    },
    {
      code: 'example',
      url: 'https://example.com',
      clicks: 5,
      lastClicked: new Date('2024-01-17T09:15:00Z'),
    },
  ]

  for (const link of sampleLinks) {
    await prisma.link.upsert({
      where: { code: link.code },
      update: {},
      create: link,
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
