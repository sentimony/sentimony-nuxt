import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '../../app/utils/sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes executable tags and event handlers', () => {
    const result = sanitizeHtml(
      '<p onclick="alert(1)">Safe<script>alert(1)</script><img src=x onerror="alert(1)"></p>',
    )

    expect(result).toContain('<p>Safe')
    expect(result).not.toContain('<script')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onerror')
  })

  it('removes javascript URLs while preserving safe links', () => {
    const result = sanitizeHtml(
      '<a href="javascript:alert(1)">Bad</a><a href="/artist/test">Good</a>',
    )

    expect(result).not.toContain('javascript:')
    expect(result).toContain('href="/artist/test"')
  })

  it('preserves catalog formatting tags', () => {
    const source = '<p><small>01.</small> <b>Artist</b> - <i>Track</i><br><a href="/release/x">Release</a></p>'

    expect(sanitizeHtml(source)).toBe(source)
  })

  it('returns an empty string for non-string input', () => {
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml(null)).toBe('')
  })

  it('strips the inner content of disallowed tags', () => {
    const result = sanitizeHtml('<p>Safe</p><script>document.cookie</script>')

    expect(result).toContain('Safe')
    expect(result).not.toContain('document.cookie')
  })

  it('handles a literal > inside a quoted attribute value', () => {
    const result = sanitizeHtml('<a title="Price > 0" href="/releases">link</a>')

    expect(result).toContain('href="/releases"')
    expect(result).toContain('link')
    expect(result).not.toContain('0"&gt;')
  })

  it('drops javascript URLs hidden behind embedded control characters', () => {
    expect(sanitizeHtml('<a href="java\tscript:alert(1)">x</a>')).not.toContain('script:')
    expect(sanitizeHtml('<a href="jav\nascript:alert(1)">x</a>')).not.toContain('script:')
  })

  it('drops javascript URLs hidden behind HTML entities', () => {
    expect(sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>')).not.toContain('avascript:')
    expect(sanitizeHtml('<a href="&#x6a;avascript:alert(1)">x</a>')).not.toContain('avascript:')
    expect(sanitizeHtml('<a href="jav&#x09;ascript:alert(1)">x</a>')).not.toContain('script:')
  })

  it('keeps only safe URL schemes on links', () => {
    expect(sanitizeHtml('<a href="https://sentimony.com">x</a>')).toContain('href="https://sentimony.com"')
    expect(sanitizeHtml('<a href="/releases">x</a>')).toContain('href="/releases"')
    expect(sanitizeHtml('<a href="mailto:hi@sentimony.com">x</a>')).toContain('href="mailto:hi@sentimony.com"')
    expect(sanitizeHtml('<a href="#anchor">x</a>')).toContain('href="#anchor"')
    expect(sanitizeHtml('<a href="data:text/html,<b>x</b>">x</a>')).not.toContain('data:')
    expect(sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>')).not.toContain('vbscript:')
  })

  it('strips the body of an unclosed executable tag', () => {
    expect(sanitizeHtml('<p>ok</p><script>document.cookie')).not.toContain('document.cookie')
    expect(sanitizeHtml('<p>ok <script>evil</p>')).not.toContain('evil')
  })
})
