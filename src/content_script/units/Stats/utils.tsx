import MdiRefresh from '~icons/mdi/refresh.jsx'

import React from '#dom'
/**
 * Turns minutes into days, hours and remaining minutes
 */
function processTime(delta: number): number[] {
  const days = Math.floor(delta / 86400)
  delta -= days * 86400
  const hours = Math.floor(delta / 3600) % 24
  delta -= hours * 3600
  let minutes = Math.floor(delta / 60) % 60
  delta -= minutes * 60

  if (days === 0 && hours === 0 && minutes === 0)
    minutes = 1

  return [days, hours, minutes]
}

/**
 * Formats amount of minutes and string (with days, hours, minutes)
 */
export function formatDuration(totalSeconds: number): string {
  const [days, hours, minutes] = processTime(totalSeconds)
  // Pluralize and join with ,
  return Object.entries({ day: days, hour: hours, min: minutes })
    .map(([type, amount]) => {
      // Don't show e.g. "0 day, [...]"
      if (!amount)
        return null

      return `${amount} ${type}${amount > 1 ? 's' : ''}`
    })
    .filter(x => x !== null)
    .join(`, `)
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Formats minutes as a time when the reading will be finished (assuming non-stop reading ofc.)
 */
export function formatFinishAt(totalSeconds: number): string {
  const now = Date.now()
  const completion = new Date(now + (totalSeconds * 1000))
  let formatted = formatTime(completion)
  const dateDiff = Math.floor((completion.getTime() - now) / (1000 * 60 * 60 * 24))
  if (dateDiff === 1)
    formatted = `tomorrow @ ${formatted}`
  else if (dateDiff > 1)
    formatted = `in ${dateDiff} days @ ${formatted}`

  return formatted
}

export function finishAtValueElement(totalSeconds: number): Element {
  let valueElement: HTMLElement

  const calcData = () => {
    const value = formatFinishAt(totalSeconds)
    const title = `Using current time of ${formatTime(new Date())}. Click to update.`
    return {
      value,
      title,
      ariaLabel: `${value}. ${title}`,
    }
  }

  const refresh = () => {
    const data = calcData()
    valueElement.querySelector('.time')!.textContent = data.value
    valueElement.title = data.title
    valueElement.setAttribute('aria-label', data.ariaLabel)
  }
  const refreshKey = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      // Prevent the default action to stop scrolling when space is pressed
      e.preventDefault()
      refresh()
    }
  }

  const data = calcData()

  valueElement = (
    <span
      title={data.title}
      aria-label={data.ariaLabel}
      tabIndex={0}
      onClick={refresh}
      onKeyDown={refreshKey}
      role="button"
    >
      <span class="time">{data.value}</span>
      <MdiRefresh />
    </span>
  )

  return valueElement
}
