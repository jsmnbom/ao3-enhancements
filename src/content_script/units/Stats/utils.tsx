import { h as createElement } from 'dom-chef';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import { mdiRefresh } from '@mdi/js';

import { icon } from '@/content_script/utils';

/**
 * Turns minutes into days, hours and remaining minutes
 */
function processTime(delta: number): number[] {
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;
  let minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  if (days === 0 && hours == 0 && minutes === 0) {
    minutes = 1;
  }

  return [days, hours, minutes];
}

/**
 * Formats amount of minutes and string (with days, hours, minutes)
 */
export function formatTime(totalSeconds: number): string {
  const [days, hours, minutes] = processTime(totalSeconds);
  // Pluralize and join with ,
  return Object.entries({ day: days, hour: hours, min: minutes })
    .map(([type, amount]) => {
      // Don't show e.g. "0 day, [...]"
      if (!amount) {
        return null;
      }
      return `${amount} ${pluralize(type, amount)}`;
    })
    .filter((x) => x !== null)
    .join(`, `);
}

/**
 * Formats minutes as a time when the reading will be finished (assuming non-stop reading ofc.)
 */
export function formatFinishAt(totalSeconds: number): string {
  const now = dayjs();
  const completion = now.add(totalSeconds, 'second');
  let formatted = completion.format('HH:mm');
  const dateDiff = completion.diff(now, 'day');
  if (dateDiff === 1) {
    formatted = `tomorrow @ ${formatted}`;
  } else if (dateDiff > 1) {
    formatted = `in ${dateDiff} days @ ${formatted}`;
  }
  //formatted = `${formatted}<svg viewBox="0 0 24 24" style="display: inline-block;top: 2px;position: relative;" height="14" width="14"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"></path></svg>`
  return formatted;
}

export function finishAtValueElement(totalSeconds: number): Element {
  const calcData = () => {
    const value = formatFinishAt(totalSeconds);
    const title = `Using current time of ${dayjs().format(
      'HH:mm'
    )}. Click to update.`;
    return {
      value,
      title,
      ariaLabel: `${value}. ${title}`,
    };
  };

  const refresh = () => {
    const data = calcData();
    valueElement.querySelector('.time')!.textContent = data.value;
    valueElement.title = data.title;
    valueElement.setAttribute('aria-label', data.ariaLabel);
  };
  const refreshKey = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      // Prevent the default action to stop scrolling when space is pressed
      e.preventDefault();
      refresh();
    }
  };

  const data = calcData();

  const valueElement = (
    <span
      title={data.title}
      aria-label={data.ariaLabel}
      tabIndex={0}
      onclick={refresh}
      onkeydown={refreshKey}
      role="button"
    >
      <span className="time">{data.value}</span>
      {icon(mdiRefresh)}
    </span>
  );

  return valueElement;
}
