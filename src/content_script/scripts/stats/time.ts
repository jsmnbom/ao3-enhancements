import dayjs from 'dayjs';

import { nbsp } from '@/common';

/**
 * Turns minutes into days, hours and remaining minutes
 */
function processTime(delta: number) {
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
export function formatTime(totalSeconds: number) {
  const [days, hours, minutes] = processTime(totalSeconds);
  let s = '';
  if (days) s += `${days}${nbsp}days,${nbsp}`;
  if (hours) s += `${hours}${nbsp}hours,${nbsp}`;
  if (minutes) s += `${minutes}${nbsp}min`;
  return s;
}

/**
 * Formats minutes as a time when the reading will be finishe (assuming non-stop reading ofc.)
 */
export function formatFinishAt(totalSeconds: number) {
  const now = dayjs();
  const completion = now.add(totalSeconds, 'second');
  let formatted = completion.format('HH:mm');
  const dateDiff = completion.diff(now, 'day');
  if (dateDiff === 1) {
    formatted = `tomorrow @${nbsp}${formatted}`;
  } else if (dateDiff > 1) {
    formatted = `in${nbsp}${dateDiff}${nbsp}days${nbsp}@${nbsp}${formatted}`;
  }
  //formatted = `${formatted}<svg viewBox="0 0 24 24" style="display: inline-block;top: 2px;position: relative;" height="14" width="14"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"></path></svg>`
  return formatted;
}
