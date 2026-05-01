export type MockEvent = {
  context: { params: Record<string, string> }
  _body: unknown
  _query: Record<string, string>
  node: { req: object, res: object }
}

export function createMockEvent(opts: {
  params?: Record<string, string>
  body?: unknown
  query?: Record<string, string>
} = {}): MockEvent {
  return {
    context: { params: opts.params ?? {} },
    _body: opts.body ?? null,
    _query: opts.query ?? {},
    node: { req: {}, res: {} },
  }
}
