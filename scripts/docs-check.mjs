#!/usr/bin/env node
/**
 * Checks structural invariants of the docs/ tree.
 *
 * Dated artifacts (audits, specs, plans) are historical snapshots: their link
 * targets are deliberately NOT validated, so a docs refactor never forces a
 * rewrite of past documents. Only living documents are link-checked.
 *
 * Usage:
 *   node scripts/docs-check.mjs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const INDEX = 'docs/ROADMAP.md'
const INITIATIVES_DIR = 'docs/initiatives'
const AUDITS_DIR = 'docs/audits'
const AUDITS_INDEX = 'docs/audits/README.md'

const STATUSES = ['Planned', 'Partial', 'Idea', 'Implemented', 'Descoped']

// Sections whose heading already carries the status, so item lines omit it.
const SECTION_STATUS = {
  'Future ideas': 'Idea',
  'Знято з обсягу': 'Descoped',
}

const DATED_DIRS = [AUDITS_DIR, 'docs/superpowers/specs', 'docs/superpowers/plans']
const DATED_NAME = /^\d{4}-\d{2}-\d{2}-/

const problems = []

const fail = (file, message, line) => {
  problems.push(`${file}${line ? `:${line}` : ''} — ${message}`)
}

const read = path => readFileSync(path, 'utf8')
const markdownFiles = dir => readdirSync(dir).filter(name => name.endsWith('.md'))

// macOS is case-insensitive, Linux CI is not: existsSync alone would pass
// locally and fail in CI, so compare the real directory entry.
const exactExists = path =>
  existsSync(path) && readdirSync(dirname(path)).includes(basename(path))

function parseIndex() {
  const entries = new Map()
  let section = ''

  read(INDEX).split('\n').forEach((text, i) => {
    const heading = text.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      section = heading[1]
      return
    }

    const link = text.match(/\]\(initiatives\/([a-z0-9-]+\.md)\)/)
    if (!link) return

    const tokens = [...text.matchAll(/`([^`]+)`/g)].map(match => match[1])
    entries.set(link[1], {
      line: i + 1,
      status: tokens.find(token => STATUSES.includes(token)) ?? SECTION_STATUS[section] ?? null,
    })
  })

  return entries
}

function checkIndexCoverage(entries) {
  const files = markdownFiles(INITIATIVES_DIR)

  for (const file of files) {
    if (!entries.has(file)) fail(INDEX, `missing index entry for initiatives/${file}`)
  }

  for (const [file, entry] of entries) {
    if (!files.includes(file)) fail(INDEX, `links to a missing initiatives/${file}`, entry.line)
  }
}

function checkStatusMatch(entries) {
  for (const [file, entry] of entries) {
    const path = join(INITIATIVES_DIR, file)
    if (!existsSync(path)) continue

    const declared = read(path).match(/^- Status:\s*(.+?)\s*$/m)?.[1]

    if (!declared) {
      fail(path, 'missing "- Status:" field')
      continue
    }

    if (!STATUSES.includes(declared)) {
      fail(path, `unknown status "${declared}" (expected one of ${STATUSES.join(', ')})`)
      continue
    }

    if (!entry.status) {
      fail(INDEX, `no status for initiatives/${file}; file declares "${declared}"`, entry.line)
      continue
    }

    if (entry.status !== declared) {
      fail(INDEX, `status "${entry.status}" for initiatives/${file}, file declares "${declared}"`, entry.line)
    }
  }
}

const REQUIRED_DOCS = [INDEX, 'docs/COMPLETED.md', AUDITS_INDEX, 'PRODUCT.md']

// A required document that silently drops out of the list would take its links
// with it, so a casing drift on macOS looks like a passing check.
function checkRequiredDocuments() {
  for (const file of REQUIRED_DOCS) {
    if (!exactExists(file)) fail(file, 'missing, or its name differs in case')
  }
}

function livingDocuments() {
  return [
    ...REQUIRED_DOCS,
    ...markdownFiles(INITIATIVES_DIR).map(file => join(INITIATIVES_DIR, file)),
  ].filter(exactExists)
}

function checkLinks() {
  for (const file of livingDocuments()) {
    read(file).split('\n').forEach((text, i) => {
      for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue

        const path = target.split('#')[0]
        if (!path.endsWith('.md')) continue

        const resolved = resolve(dirname(file), path)
        if (!exactExists(resolved)) fail(file, `broken link to ${path}`, i + 1)
      }
    })
  }
}

function checkAuditsIndex() {
  const index = read(AUDITS_INDEX)

  for (const file of markdownFiles(AUDITS_DIR)) {
    if (file === 'README.md') continue
    if (!index.includes(`(${file})`)) fail(AUDITS_INDEX, `missing index entry for ${file}`)
  }
}

function checkDatedNames() {
  for (const dir of DATED_DIRS) {
    for (const file of markdownFiles(dir)) {
      if (file === 'README.md') continue
      if (!DATED_NAME.test(file)) fail(join(dir, file), 'name must start with YYYY-MM-DD-')
    }
  }
}

const entries = parseIndex()

checkRequiredDocuments()
checkIndexCoverage(entries)
checkStatusMatch(entries)
checkLinks()
checkAuditsIndex()
checkDatedNames()

if (problems.length) {
  console.error(`docs-check: ${problems.length} problem(s)\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`docs-check: ok (${entries.size} initiatives, ${livingDocuments().length} living documents)`)
