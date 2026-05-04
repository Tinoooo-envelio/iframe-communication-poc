import { type MaybeRef, type MaybeRefOrGetter } from 'vue'

const sync = <T>(
  state: Ref<T>,
  getTarget: () => Window | null,
  isParent: boolean,
  REQUEST: string,
  UPDATE: string,
) => {
  const read = () => (isRef(state) ? state.value : state)

  const write = (value: any) => {
    if (isRef(state)) {
      state.value = value
    } else {
      Object.assign(state as object, value)
    }
  }

  const send = (type: string, value?: unknown) => {
    const payload = value === undefined ? { type } : { type, value: JSON.parse(JSON.stringify(value)) }
    getTarget()?.postMessage(payload, '*')
  }

  let suppress = false
  const onMessage = (event: MessageEvent) => {
    const data = event.data
    if (!data || typeof data !== 'object') return
    if (data.type === REQUEST && isParent) {
      send(UPDATE, read())
    } else if (data.type === UPDATE) {
      suppress = true
      write(data.value)
      nextTick(() => {
        suppress = false
      })
    }
  }

  const stop = watch(
    state,
    () => {
      if (suppress) return
      send(UPDATE, read())
    },
    { deep: true },
  )

  if (window)
    window.addEventListener('message', onMessage)
  onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
    stop()
  })

  return { send }
}

/**
 * Create a pair of composables that share state between a parent window
 * and a child iframe via postMessage.
 */
export const createIframeSharedState = <T extends object>(key = 'default') => {

  const REQUEST = `iframe-shared-state:${key}:request`
  const UPDATE = `iframe-shared-state:${key}:update`
  const useProvideSharedState = (
    iframe: MaybeRefOrGetter<HTMLIFrameElement | null | undefined>,
    state: Ref<T>,
  ) => {
    sync(state, () => toValue(iframe)?.contentWindow ?? null, true, REQUEST, UPDATE)
  }

  const useSharedState = (state: Ref<T>) => {
    if (!window)
      return

    const { send } = sync(state, () => window.parent, false, REQUEST, UPDATE)
    send(REQUEST)
  }

  return [useProvideSharedState, useSharedState] as const
}
