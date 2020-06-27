import Unit from '@/content_script/Unit';
import { HideWorks } from './HideWorks';
import { StyleTweaks } from './StyleTweaks';
import { Tools } from './Tools';
import { Stats } from './Stats';
import { TrackWorks } from './TrackWorks';

export default [
  StyleTweaks,
  TrackWorks,
  HideWorks,
  Tools,
  Stats,
] as typeof Unit[];
