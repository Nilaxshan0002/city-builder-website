import { drizzle } from 'drizzle-orm/netlify-db'
import { eq } from 'drizzle-orm'
import { cities } from '../../db/schema.js'
import { citySchema } from '../../src/game/model.js'
export default async (req: Request) => {
  const headers = { 'Cache-Control': 'no-store' }
  const id = new URL(req.url).searchParams.get('id')
  if (!id || !/^[a-f0-9-]{36}$/.test(id))
    return Response.json(
      { error: 'Invalid save identifier' },
      { status: 400, headers },
    )
  try {
    const db = drizzle()
    if (req.method === 'GET') {
      const [city] = await db.select().from(cities).where(eq(cities.id, id))
      return Response.json({ state: city?.state ?? null }, { headers })
    }
    if (req.method === 'POST') {
      if (Number(req.headers.get('content-length')) > 20000)
        return new Response('Save too large', { status: 413 })
      const parsed = citySchema.safeParse(await req.json())
      if (!parsed.success)
        return Response.json(
          { error: 'Invalid city data' },
          { status: 400, headers },
        )
      await db
        .insert(cities)
        .values({ id, state: parsed.data })
        .onConflictDoUpdate({
          target: cities.id,
          set: { state: parsed.data, updatedAt: new Date() },
        })
      return Response.json({ saved: true }, { headers })
    }
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...headers, Allow: 'GET, POST' },
    })
  } catch {
    return Response.json(
      {
        error:
          'Cloud save is unavailable. Your current city is still playable; please try again.',
      },
      { status: 503, headers },
    )
  }
}
