import { vi, type Mock } from 'vitest'

export type SupabaseResult = {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}

export type SupabaseChainMock = {
  from: Mock
  select: Mock
  eq: Mock
  in: Mock
  range: Mock
  order: Mock
  insert: Mock
  upsert: Mock
  delete: Mock
  then: (resolve: (value: SupabaseResult) => void) => void
}

export function createSupabaseChainMock(result: SupabaseResult = { data: [], error: null }): SupabaseChainMock {
  const chain = {} as SupabaseChainMock
  const methods: Array<keyof SupabaseChainMock> = ['from', 'select', 'eq', 'in', 'range', 'order', 'insert', 'upsert', 'delete']
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain) as Mock
  })
  chain.then = (resolve) => {
    Promise.resolve(result).then(resolve)
  }
  return chain
}
