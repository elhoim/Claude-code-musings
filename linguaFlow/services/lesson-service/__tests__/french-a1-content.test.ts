import { FRENCH_A1_UNITS, FRENCH_A1_PLACEMENT_QUESTIONS } from '../src/db/seeds/french-a1-content';
import { describeLessonSeedData } from './helpers/validate-lesson-seed';

describeLessonSeedData('FRENCH_A1', FRENCH_A1_UNITS, FRENCH_A1_PLACEMENT_QUESTIONS);
