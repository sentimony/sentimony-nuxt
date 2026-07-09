import { describe, expect, it } from 'vitest'
import { formatDuration } from '../../app/utils/formatDuration'

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('pads seconds under 10', () => {
    expect(formatDuration(5)).toBe('0:05')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
  })

  it('formats exactly one hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
  })

  it('formats the Tempo Syndicate mix total time (1:19:40)', () => {
    expect(formatDuration(4780)).toBe('1:19:40')
  })

  it('treats NaN as zero', () => {
    expect(formatDuration(NaN)).toBe('0:00')
  })

  it('treats negative input as zero', () => {
    expect(formatDuration(-5)).toBe('0:00')
  })
})
