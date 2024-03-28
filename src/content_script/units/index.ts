import type { Unit } from '#common'

import { HideWorks } from './HideWorks.js'
import { Stats } from './Stats/Stats.js'
import { StyleTweaks } from './StyleTweaks.js'
import { ThemeUpdater } from './ThemeUpdater.js'
import { Tools } from './Tools.js'
import { UserUpdater } from './UserUpdater.js'

export const UNITS = [
  UserUpdater,
  StyleTweaks,
  HideWorks,
  Tools,
  Stats,
  ThemeUpdater,
] as typeof Unit[]
