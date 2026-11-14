export function debounce<T extends (...args: Parameters<T>) => void>(f: T, millis = 500) {
  let timer: ReturnType<typeof setTimeout>
  return Object.assign(function (...args: Parameters<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => f(...args), millis)
  }, {cancel: () => clearTimeout(timer)})
}
