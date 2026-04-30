import { SPANISH_A1_UNITS, SPANISH_A1_PLACEMENT_QUESTIONS } from '../src/db/seeds/spanish-a1-content';
import { describeLessonSeedData } from './helpers/validate-lesson-seed';

describeLessonSeedData('SPANISH_A1', SPANISH_A1_UNITS, SPANISH_A1_PLACEMENT_QUESTIONS);
