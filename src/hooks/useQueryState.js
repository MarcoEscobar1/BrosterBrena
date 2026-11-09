import { useSearchParams } from 'react-router-dom'

// Keep list filters and pagination available when returning from a detail screen.
export function useQueryState(key, initialValue) {
  const [params, setParams] = useSearchParams()
  const decode = value => value == null ? initialValue : typeof initialValue === 'number' ? Math.max(0, Number(value) || 0) : value
  const value = decode(params.get(key))
  const setValue = update => setParams(previous => {
    const next = new URLSearchParams(previous)
    const resolved = typeof update === 'function' ? update(decode(previous.get(key))) : update
    if (resolved === initialValue || resolved === '') next.delete(key)
    else next.set(key, String(resolved))
    return next
  }, { replace: true })
  return [value, setValue]
}
