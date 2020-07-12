import Unit from '@/content_script/Unit';

import { HideWorks } from './HideWorks';
import { StyleTweaks } from './StyleTweaks';
import { Tools } from './Tools';
import { Stats } from './Stats/Stats';
import { TrackWorks } from './TrackWorks';
import { UserUpdater } from './UserUpdater';

export default [
  UserUpdater,
  StyleTweaks,
  HideWorks,
  Tools,
  Stats,
  TrackWorks,
] as typeof Unit[];
