import { FLEMISH_A1_UNITS, FLEMISH_A1_PLACEMENT_QUESTIONS } from '../src/db/seeds/flemish-a1-content';
import { describeLessonSeedData } from './helpers/validate-lesson-seed';

describeLessonSeedData('FLEMISH_A1', FLEMISH_A1_UNITS, FLEMISH_A1_PLACEMENT_QUESTIONS);
