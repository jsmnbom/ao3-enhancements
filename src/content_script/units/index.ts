import Unit from '@/content_script/Unit';

import { HideWorks } from './HideWorks';
import { StyleTweaks } from './StyleTweaks';
import { Tools } from './Tools';
import { Stats } from './Stats/Stats';
import { UserUpdater } from './UserUpdater';
import { ReadingList } from './ReadingList/ReadingList';
import { ThemeUpdater } from './ThemeUpdater';

export default [
  UserUpdater,
  StyleTweaks,
  HideWorks,
  Tools,
  Stats,
  ReadingList,
  ThemeUpdater,
] as typeof Unit[];
