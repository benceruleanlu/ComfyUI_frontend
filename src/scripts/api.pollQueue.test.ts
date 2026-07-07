import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ComfyApi } from '@/scripts/api'

class MockWebSocket {
  static instances: MockWebSocket[] = []

  readonly addEventListener = vi.fn(
    (event: string, handler: (event: Event) => void) => {
      this.handlers.set(event, handler)
    }
  )
  readonly close = vi.fn(() => {
    this.handlers.get('close')?.(new Event('close'))
  })
  readonly send = vi.fn()
  readonly handlers = new Map<string, (event: Event) => void>()
  binaryType = 'arraybuffer'

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this)
  }

  trigger(event: string) {
    this.handlers.get(event)?.(new Event(event))
  }
}

describe('ComfyApi websocket polling fallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('stops polling after the websocket reconnects', async () => {
    const api = new ComfyApi()
    const fetchApiSpy = vi
      .spyOn(api, 'fetchApi')
      .mockResolvedValue(new Response('{}'))

    api.init()
    const firstSocket = MockWebSocket.instances[0]

    firstSocket.trigger('error')

    await vi.advanceTimersByTimeAsync(300)
    const reconnectSocket = MockWebSocket.instances[1]

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchApiSpy).toHaveBeenCalledTimes(1)

    reconnectSocket.trigger('open')

    await vi.advanceTimersByTimeAsync(5000)

    expect(fetchApiSpy).toHaveBeenCalledTimes(1)
    expect(reconnectSocket.send).toHaveBeenCalledOnce()
  })

  it('does not stack multiple pollers when _pollQueue runs twice', async () => {
    const api = new ComfyApi()
    const fetchApiSpy = vi
      .spyOn(api, 'fetchApi')
      .mockResolvedValue(new Response('{}'))

    const pollQueue = api as unknown as { _pollQueue: () => void }

    pollQueue._pollQueue()
    pollQueue._pollQueue()

    await vi.advanceTimersByTimeAsync(1000)

    expect(fetchApiSpy).toHaveBeenCalledTimes(1)
  })
})
