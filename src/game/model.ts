import { z } from 'zod'
export const kinds = [
  'house',
  'apartment',
  'shop',
  'office',
  'park',
  'road',
  'solar',
  'water',
] as const
export type Kind = (typeof kinds)[number]
export const catalog: {
  kind: Kind
  name: string
  category: string
  cost: number
  people: number
  income: number
  color: string
  description: string
}[] = [
  {
    kind: 'house',
    name: 'Cozy cottage',
    category: 'Residential',
    cost: 250,
    people: 24,
    income: 12,
    color: '#efad7f',
    description: 'A happy place to call home. +24 residents',
  },
  {
    kind: 'apartment',
    name: 'Garden apartments',
    category: 'Residential',
    cost: 800,
    people: 90,
    income: 36,
    color: '#e4be75',
    description: 'Room for a growing neighborhood. +90 residents',
  },
  {
    kind: 'shop',
    name: 'Corner market',
    category: 'Commercial',
    cost: 500,
    people: 0,
    income: 65,
    color: '#e58c7f',
    description: 'Local shops, lively streets. +65 income/day',
  },
  {
    kind: 'office',
    name: 'Creative studio',
    category: 'Commercial',
    cost: 1200,
    people: 0,
    income: 140,
    color: '#9dc3ce',
    description: 'Big ideas start here. +140 income/day',
  },
  {
    kind: 'park',
    name: 'Pocket park',
    category: 'Nature',
    cost: 150,
    people: 0,
    income: 0,
    color: '#79ac74',
    description: 'A little green goes a long way. +3 happiness',
  },
  {
    kind: 'road',
    name: 'Neighborhood road',
    category: 'Infrastructure',
    cost: 40,
    people: 0,
    income: 0,
    color: '#b2bbb5',
    description: 'Connect your neighborhoods, one tile at a time.',
  },
  {
    kind: 'solar',
    name: 'Solar station',
    category: 'Infrastructure',
    cost: 600,
    people: 0,
    income: 30,
    color: '#859eaf',
    description: 'Clean energy for your city. +30 income/day',
  },
  {
    kind: 'water',
    name: 'Water tower',
    category: 'Infrastructure',
    cost: 450,
    people: 0,
    income: 20,
    color: '#9bc7cb',
    description: 'Keep your city flowing. +20 income/day',
  },
]
export const citySchema = z.object({
  name: z.string().min(1).max(32),
  coins: z.number().min(0).max(1e12),
  day: z.number().int().min(1).max(1e7),
  tiles: z.array(z.enum([...kinds, 'empty', 'tree', 'river'])).length(144),
  claimed: z.array(z.number().int().min(0).max(2)).max(3),
})
export type City = z.infer<typeof citySchema>
export function newCity(): City {
  const tiles: City['tiles'] = Array.from({ length: 144 }, (_, i) => {
    const x = i % 12,
      y = Math.floor(i / 12)
    return x > 9 || (x === 9 && y > 6)
      ? 'river'
      : x === 4 || y === 6
        ? 'road'
        : (x * 7 + y * 13) % 9 === 0
          ? 'tree'
          : 'empty'
  })
  const place = (x: number, y: number, k: Kind) => {
    tiles[y * 12 + x] = k
  }
  ;[
    [2, 2],
    [3, 3],
    [1, 4],
    [5, 3],
    [6, 4],
    [7, 7],
    [3, 8],
    [5, 9],
    [1, 7],
  ].forEach(([x, y]) => place(x, y, 'house'))
  ;[
    [5, 1],
    [6, 2],
    [2, 8],
  ].forEach(([x, y]) => place(x, y, 'apartment'))
  place(5, 5, 'shop')
  place(3, 5, 'shop')
  place(7, 3, 'office')
  place(7, 5, 'park')
  place(2, 3, 'park')
  place(6, 8, 'park')
  place(8, 1, 'water')
  place(7, 9, 'solar')
  return { name: 'Willow Creek', coins: 12500, day: 1, tiles, claimed: [] }
}
export function stats(city: City) {
  const count = (kind: string) => city.tiles.filter((t) => t === kind).length
  return {
    population: catalog.reduce((n, b) => n + count(b.kind) * b.people, 0),
    income: catalog.reduce((n, b) => n + count(b.kind) * b.income, 0),
    happiness: Math.min(
      100,
      65 + count('park') * 3 + count('water') * 2 + count('solar') * 2,
    ),
    buildings: city.tiles.filter(
      (t) => !['empty', 'tree', 'river', 'road'].includes(t),
    ).length,
    parks: count('park'),
  }
}
