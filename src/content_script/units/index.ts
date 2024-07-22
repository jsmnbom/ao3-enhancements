import type { Unit } from '#content_script/Unit.js'

import { HideWorks } from './HideWorks.tsx'
import { OptionsUpdater } from './OptionsUpdater.tsx'
import { Stats } from './Stats/Stats.ts'
import { StyleTweaks } from './StyleTweaks.tsx'
import { Tools } from './Tools.tsx'

export const UNITS = [
  StyleTweaks,
  HideWorks,
  Tools,
  Stats,
  OptionsUpdater,
] as typeof Unit[]
