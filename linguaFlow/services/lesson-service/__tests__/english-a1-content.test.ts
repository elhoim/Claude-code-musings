import { ENGLISH_A1_UNITS, ENGLISH_A1_PLACEMENT_QUESTIONS } from '../src/db/seeds/english-a1-content';
import { describeLessonSeedData } from './helpers/validate-lesson-seed';

describeLessonSeedData('ENGLISH_A1', ENGLISH_A1_UNITS, ENGLISH_A1_PLACEMENT_QUESTIONS);
