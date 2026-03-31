/**
 * English A1 Grammar Graph Seed Data
 * Grammar nodes and prerequisite edges for the A1 level
 * English as a foreign language
 */

export interface GrammarNodeSeed {
  slug: string;
  name: string;
  nameInTarget: string;
  cefrLevel: string;
  category: string;
  shortDescription: string;
  fullExplanation: string;
  prerequisites: string[];
  examples: {
    target: string;
    native: string;
    highlightRange: [number, number];
    notes?: string;
  }[];
  order: number;
}

export const ENGLISH_A1_GRAMMAR_NODES: GrammarNodeSeed[] = [
  // ── Articles ──
  {
    slug: 'articles-the-a-an',
    name: 'Articles: the, a, an',
    nameInTarget: 'Articles: the, a, an',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: '"The" for specific, "a/an" for general.',
    fullExplanation:
      'English has three articles: "the" (definite — refers to something specific), "a" (indefinite — before consonant sounds), and "an" (indefinite — before vowel sounds). "The" is used when both speaker and listener know what is referred to. "A/an" is used for non-specific items. "A book" (any book), "the book" (a specific book). No article is needed for general plurals or uncountable nouns: "I like music."',
    prerequisites: [],
    examples: [
      { target: 'The cat is on the table.', native: 'A specific cat, a specific table.', highlightRange: [0, 3] },
      { target: 'I have a dog.', native: 'One dog, not specific.', highlightRange: [7, 8] },
      { target: 'She is an artist.', native: '"An" before vowel sound.', highlightRange: [7, 9], notes: '"An" before "a" sound in "artist"' },
    ],
    order: 0,
  },

  // ── Noun Plurals ──
  {
    slug: 'noun-plurals',
    name: 'Noun Plurals',
    nameInTarget: 'Noun Plurals',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'Most nouns add -s or -es for plural.',
    fullExplanation:
      'Regular plurals: add -s (cat → cats, book → books). Nouns ending in -s, -sh, -ch, -x, -z add -es (bus → buses, dish → dishes). Nouns ending in consonant + y change to -ies (city → cities). Common irregulars: man → men, woman → women, child → children, person → people, tooth → teeth, foot → feet, mouse → mice.',
    prerequisites: [],
    examples: [
      { target: 'I have two cats.', native: 'cat + s = cats', highlightRange: [11, 15] },
      { target: 'There are three buses.', native: 'bus + es = buses', highlightRange: [16, 21] },
      { target: 'The children are playing.', native: 'Irregular: child → children', highlightRange: [4, 12] },
    ],
    order: 1,
  },

  // ── Subject Pronouns ──
  {
    slug: 'subject-pronouns',
    name: 'Subject Pronouns',
    nameInTarget: 'Subject Pronouns',
    cefrLevel: 'A1',
    category: 'pronouns',
    shortDescription: 'I, you, he, she, it, we, they.',
    fullExplanation:
      'Subject pronouns replace the subject of a sentence: I (the speaker), you (the listener, singular or plural), he (male), she (female), it (thing/animal), we (the speaker + others), they (other people/things). English always requires a subject pronoun — you cannot omit it like in some languages.',
    prerequisites: [],
    examples: [
      { target: 'I am a teacher.', native: 'The speaker.', highlightRange: [0, 1] },
      { target: 'She is my sister.', native: 'A female person.', highlightRange: [0, 3] },
      { target: 'They live in Paris.', native: 'A group of people.', highlightRange: [0, 4] },
    ],
    order: 2,
  },

  // ── To Be ──
  {
    slug: 'to-be-present',
    name: 'To Be — Present Tense',
    nameInTarget: 'To Be — Present Tense',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'am, is, are — the most important verb.',
    fullExplanation:
      '"To be" is irregular: I am, you are, he/she/it is, we are, they are. Contractions: I\'m, you\'re, he\'s/she\'s/it\'s, we\'re, they\'re. Used for identity (I am a student), descriptions (She is tall), location (They are at home), nationality (He is Spanish), age (I am 25), and feelings (We are happy).',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'I am a student.', native: 'Identity.', highlightRange: [2, 4] },
      { target: 'She is tall.', native: 'Description.', highlightRange: [4, 6] },
      { target: 'They are at home.', native: 'Location.', highlightRange: [5, 8] },
    ],
    order: 3,
  },

  // ── To Have ──
  {
    slug: 'to-have-present',
    name: 'To Have — Present Tense',
    nameInTarget: 'To Have — Present Tense',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'have/has — possession, family, features.',
    fullExplanation:
      '"To have" for possession and description: I/you/we/they have, he/she/it has. Used for possession (I have a car), family (She has two brothers), physical features (He has blue eyes), meals (We have lunch at 12), and illnesses (I have a cold). Negative: don\'t have / doesn\'t have.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'I have a car.', native: 'Possession.', highlightRange: [2, 6] },
      { target: 'She has two brothers.', native: '"Has" for he/she/it.', highlightRange: [4, 7] },
      { target: 'We have lunch at noon.', native: 'Meals.', highlightRange: [3, 7] },
    ],
    order: 4,
  },

  // ── Regular Verbs Present ──
  {
    slug: 'regular-verbs-present',
    name: 'Simple Present Tense',
    nameInTarget: 'Simple Present Tense',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'For habits, routines, and facts.',
    fullExplanation:
      'The simple present uses the base form of the verb: I work, you work, we work, they work. For he/she/it, add -s: he works. Used for habits (I drink coffee every morning), routines (She goes to school), facts (Water boils at 100°C), and likes/dislikes (They like pizza). Negative: don\'t/doesn\'t + base form.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'I work in an office.', native: 'Base form for I/you/we/they.', highlightRange: [2, 6] },
      { target: 'She works in a hospital.', native: 'Add -s for he/she/it.', highlightRange: [4, 9] },
      { target: 'They play football.', native: 'Routine/habit.', highlightRange: [5, 9] },
    ],
    order: 5,
  },

  // ── Third Person -s ──
  {
    slug: 'third-person-s',
    name: 'Third Person -s',
    nameInTarget: 'Third Person -s',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'He/she/it adds -s to the verb.',
    fullExplanation:
      'In simple present, he/she/it takes -s: work → works, play → plays. Verbs ending in -s, -sh, -ch, -x, -o add -es: go → goes, watch → watches. Verbs ending in consonant + y change to -ies: study → studies, carry → carries. Exceptions: have → has. This rule ONLY applies to simple present affirmative.',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'He plays tennis.', native: 'play + s', highlightRange: [3, 8] },
      { target: 'She goes to work.', native: 'go + es', highlightRange: [4, 8] },
      { target: 'It studies well.', native: 'study → studies (y → ies)', highlightRange: [3, 10] },
    ],
    order: 6,
  },

  // ── Question Formation ──
  {
    slug: 'question-formation',
    name: 'Question Formation',
    nameInTarget: 'Question Formation',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Do/Does + subject + verb, Wh-questions.',
    fullExplanation:
      'Yes/no questions: Do + I/you/we/they + base verb? Does + he/she/it + base verb? "Do you like coffee?" "Does she work here?" With "to be": invert subject and verb: "Are you happy?" "Is he a teacher?" Wh-questions: What, Where, When, Who, Why, How + do/does/is/are: "Where do you live?" "What is your name?"',
    prerequisites: ['to-be-present', 'regular-verbs-present'],
    examples: [
      { target: 'Do you like pizza?', native: 'Do + you + base verb', highlightRange: [0, 2] },
      { target: 'Where does she live?', native: 'Wh + does + subject + base verb', highlightRange: [0, 5] },
      { target: 'Are you happy?', native: 'Inversion with "to be"', highlightRange: [0, 3] },
    ],
    order: 7,
  },

  // ── Negation ──
  {
    slug: 'negation-do-not',
    name: "Negation with don't/doesn't",
    nameInTarget: "Negation with don't/doesn't",
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: "don't / doesn't + base verb.",
    fullExplanation:
      'To negate simple present: I/you/we/they + don\'t (do not) + base verb: "I don\'t like fish." He/she/it + doesn\'t (does not) + base verb: "She doesn\'t work on Sundays." With "to be": add "not" after the verb: "I am not tired", "He is not here", "They are not ready." Contractions: isn\'t, aren\'t.',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: "I don't like fish.", native: "don't + base verb", highlightRange: [2, 7] },
      { target: "She doesn't work today.", native: "doesn't + base verb (no -s)", highlightRange: [4, 12] },
      { target: 'He is not here.', native: '"to be" + not', highlightRange: [6, 9] },
    ],
    order: 8,
  },

  // ── Possessive Adjectives ──
  {
    slug: 'possessive-adjectives',
    name: 'Possessive Adjectives',
    nameInTarget: 'Possessive Adjectives',
    cefrLevel: 'A1',
    category: 'adjectives',
    shortDescription: 'my, your, his, her, its, our, their.',
    fullExplanation:
      'Possessive adjectives show ownership: my (I), your (you), his (he), her (she), its (it), our (we), their (they). They go before the noun: "my book", "her car". They don\'t change for singular/plural: "my cat" / "my cats". Common mistake: "its" (possessive) vs "it\'s" (it is).',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'This is my book.', native: 'Belongs to me.', highlightRange: [8, 10] },
      { target: 'Her name is Anna.', native: 'Belongs to her.', highlightRange: [0, 3] },
      { target: 'Their house is big.', native: 'Belongs to them.', highlightRange: [0, 5] },
    ],
    order: 9,
  },

  // ── Prepositions of Place ──
  {
    slug: 'prepositions-of-place',
    name: 'Prepositions of Place',
    nameInTarget: 'Prepositions of Place',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'in, on, at, under, next to, behind, in front of.',
    fullExplanation:
      'Prepositions describe location: in (inside: in the box, in London), on (surface: on the table, on the wall), at (point: at school, at the door), under (below), next to (beside), behind (at the back of), in front of (facing), between (in the middle of two things). "In" for cities/countries, "at" for addresses/buildings, "on" for streets.',
    prerequisites: ['articles-the-a-an'],
    examples: [
      { target: 'The cat is on the table.', native: 'On a surface.', highlightRange: [11, 13] },
      { target: 'She is at school.', native: 'At a location/building.', highlightRange: [7, 9] },
      { target: 'The book is under the chair.', native: 'Below something.', highlightRange: [12, 17] },
    ],
    order: 10,
  },

  // ── There is / There are ──
  {
    slug: 'there-is-there-are',
    name: 'There is / There are',
    nameInTarget: 'There is / There are',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Express that something exists.',
    fullExplanation:
      '"There is" + singular/uncountable noun: "There is a book on the table." "There are" + plural noun: "There are three cats." Questions: "Is there a bank near here?" "Are there any shops?" Negative: "There isn\'t a pool." "There aren\'t any restaurants."',
    prerequisites: ['articles-the-a-an', 'noun-plurals'],
    examples: [
      { target: 'There is a park nearby.', native: 'Singular: there is.', highlightRange: [0, 8] },
      { target: 'There are two banks.', native: 'Plural: there are.', highlightRange: [0, 9] },
      { target: 'Is there a toilet here?', native: 'Question form.', highlightRange: [0, 8] },
    ],
    order: 11,
  },

  // ── Going to Future ──
  {
    slug: 'going-to-future',
    name: 'Going to — Future Plans',
    nameInTarget: 'Going to — Future Plans',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'am/is/are + going to + verb for future plans.',
    fullExplanation:
      'Use "going to" for future plans and intentions: I am going to study (I plan to study). Formation: subject + am/is/are + going to + base verb. "She is going to travel next month." Questions: "Are you going to come?" Negative: "I\'m not going to work tomorrow."',
    prerequisites: ['to-be-present'],
    examples: [
      { target: "I'm going to cook dinner.", native: 'A future plan.', highlightRange: [4, 12] },
      { target: 'They are going to move.', native: 'Future intention.', highlightRange: [9, 17] },
      { target: 'Is she going to come?', native: 'Question about future.', highlightRange: [7, 15] },
    ],
    order: 12,
  },

  // ── Present Continuous ──
  {
    slug: 'present-continuous',
    name: 'Present Continuous',
    nameInTarget: 'Present Continuous',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'am/is/are + verb-ing for actions happening now.',
    fullExplanation:
      'The present continuous describes actions happening right now: I am reading, she is eating. Formation: subject + am/is/are + verb-ing. Spelling: most verbs add -ing (play → playing). Verbs ending in -e drop it (make → making). Short verbs with CVC double the last consonant (run → running, sit → sitting).',
    prerequisites: ['to-be-present'],
    examples: [
      { target: 'I am reading a book.', native: 'Happening right now.', highlightRange: [5, 12] },
      { target: 'She is making dinner.', native: 'make → making (drop -e).', highlightRange: [7, 13] },
      { target: 'They are running.', native: 'run → running (double n).', highlightRange: [9, 16] },
    ],
    order: 13,
  },

  // ── Adverbs of Frequency ──
  {
    slug: 'adverbs-of-frequency',
    name: 'Adverbs of Frequency',
    nameInTarget: 'Adverbs of Frequency',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'always, usually, sometimes, never.',
    fullExplanation:
      'Adverbs of frequency tell how often: always (100%), usually (80%), often (60%), sometimes (40%), rarely (20%), never (0%). Position: before the main verb (I always eat breakfast), after "to be" (She is never late). "Sometimes" and "usually" can also start the sentence: "Sometimes I walk to work."',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'I always drink coffee.', native: 'Before the main verb.', highlightRange: [2, 8] },
      { target: 'She is never late.', native: 'After "to be".', highlightRange: [7, 12] },
      { target: 'Sometimes I walk to work.', native: 'At the start of a sentence.', highlightRange: [0, 9] },
    ],
    order: 14,
  },

  // ── Object Pronouns ──
  {
    slug: 'object-pronouns',
    name: 'Object Pronouns',
    nameInTarget: 'Object Pronouns',
    cefrLevel: 'A1',
    category: 'pronouns',
    shortDescription: 'me, you, him, her, it, us, them.',
    fullExplanation:
      'Object pronouns receive the action: me (I), you (you), him (he), her (she), it (it), us (we), them (they). They go after the verb or preposition: "Call me", "I love her", "Give it to them", "He is looking at us". Don\'t confuse with subject pronouns: "She likes him" (not "She likes he").',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Can you help me?', native: '"Me" receives the action.', highlightRange: [14, 16] },
      { target: 'I like her.', native: '"Her" is the object.', highlightRange: [7, 10] },
      { target: 'Tell them the news.', native: '"Them" receives the action.', highlightRange: [5, 9] },
    ],
    order: 15,
  },
];

/**
 * Edges are derived from the prerequisites array in each node.
 * They map slug references to actual DB-generated UUIDs at seed time.
 */
export function buildGrammarEdges(nodes: GrammarNodeSeed[]): { fromSlug: string; toSlug: string }[] {
  const edges: { fromSlug: string; toSlug: string }[] = [];
  for (const node of nodes) {
    for (const prereqSlug of node.prerequisites) {
      edges.push({ fromSlug: prereqSlug, toSlug: node.slug });
    }
  }
  return edges;
}
