import type { Unit } from '#common'

import { HideWorks } from './HideWorks.tsx'
import { Stats } from './Stats/Stats.ts'
import { StyleTweaks } from './StyleTweaks.tsx'
import { ThemeUpdater } from './ThemeUpdater.tsx'
import { Tools } from './Tools.tsx'

export const UNITS = [
  StyleTweaks,
  HideWorks,
  Tools,
  Stats,
  ThemeUpdater,
] as typeof Unit[]
