import { describe, it, expect } from 'vitest'
import { locationToIso2 } from '../../app/utils/countryFlag'

describe('locationToIso2', () => {
  it('returns code for "City, Country"', () => {
    expect(locationToIso2('Kyiv, Ukraine')).toBe('ua')
  })
  it('uses last segment after -> for dual-residency', () => {
    expect(locationToIso2('Kyiv, Ukraine -> Warsaw, Poland')).toBe('pl')
  })
  it('handles country-only string', () => {
    expect(locationToIso2('Germany')).toBe('de')
  })
  it('returns null for empty string', () => {
    expect(locationToIso2('')).toBeNull()
  })
  it('returns null for unknown country', () => {
    expect(locationToIso2('City, Xanadu')).toBeNull()
  })
  it('handles multi-hop "City, A -> City, B"', () => {
    expect(locationToIso2('Knysna, South Africa -> Antwerp, Belgium')).toBe('be')
  })
  it('handles United States', () => {
    expect(locationToIso2('San Francisco, United States')).toBe('us')
  })
  it('handles USA abbreviation', () => {
    expect(locationToIso2('New York, USA')).toBe('us')
  })
  it('handles DB typo "Panam"', () => {
    expect(locationToIso2('Panama City, Panam')).toBe('pa')
  })
})
