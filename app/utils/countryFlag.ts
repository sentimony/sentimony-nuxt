const countryMap: Record<string, string> = {
  'ukraine': 'ua',
  'russian federation': 'ru',
  'russian': 'ru',
  'usa': 'us',
  'united states': 'us',
  'germany': 'de',
  'italy': 'it',
  'france': 'fr',
  'denmark': 'dk',
  'sweden': 'se',
  'netherlands': 'nl',
  'greece': 'gr',
  'malta': 'mt',
  'south africa': 'za',
  'australia': 'au',
  'brazil': 'br',
  'mexico': 'mx',
  'romania': 'ro',
  'united kingdom': 'gb',
  'india': 'in',
  'north macedonia': 'mk',
  'guatemala': 'gt',
  'chile': 'cl',
  'austria': 'at',
  'poland': 'pl',
  'belgium': 'be',
  'panam': 'pa',
  'panama': 'pa',
  'montenegro': 'me',
}

export function locationToIso2(location: string): string | null {
  if (!location?.trim()) return null
  const lastSegment = location.split('->').pop()?.trim() ?? location
  const country = lastSegment.split(',').pop()?.trim().toLowerCase() ?? ''
  return countryMap[country] ?? null
}
