import { ref, watch, type Ref } from 'vue'

/** A ref that is loaded from and persisted to localStorage as JSON. */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const state = ref(initial) as Ref<T>

  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) state.value = JSON.parse(raw) as T
  } catch {
    // Unavailable or corrupt storage: fall back to the initial value.
  }

  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Storage full or blocked: keep working in memory.
      }
    },
    { deep: true },
  )

  return state
}
