import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { wpm, accuracy } = await request.json()

  const score = await prisma.score.create({
    data: { wpm, accuracy },
  })

  return Response.json(score, { status: 201 })
}

export async function GET() {
  const scores = await prisma.score.findMany({
    orderBy: { wpm: 'desc' },
    take: 10,
  })

  return Response.json(scores)
}
