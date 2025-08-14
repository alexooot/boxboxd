export interface Season {
  year: number
  raceCount: number
  available: boolean
  isCurrentSeason?: boolean
}

export const SEASONS: Season[] = [
  { year: 2024, raceCount: 24, available: true, isCurrentSeason: true },
  { year: 2023, raceCount: 23, available: false },
  { year: 2022, raceCount: 22, available: false },
  { year: 2021, raceCount: 22, available: false },
]

export function getCurrentSeason(): Season {
  const availableSeasons = SEASONS.filter(s => s.available)
  return availableSeasons.sort((a, b) => b.year - a.year)[0] || SEASONS[0]
}

export function getSeason(year: number): Season | undefined {
  return SEASONS.find(s => s.year === year)
}

export function isSeasonAvailable(year: number): boolean {
  return SEASONS.find(s => s.year === year)?.available || false
}