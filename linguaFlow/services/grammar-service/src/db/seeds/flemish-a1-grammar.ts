/**
 * Flemish/Dutch A1 Grammar Graph Seed Data
 * Grammar nodes and prerequisite edges for the A1 level
 */

export interface GrammarNodeSeed {
  slug: string;
  name: string;
  nameInTarget: string;
  cefrLevel: string;
  category: string;
  shortDescription: string;
  fullExplanation: string;
  prerequisites: string[]; // slugs of prerequisite nodes
  examples: {
    target: string;
    native: string;
    highlightRange: [number, number];
    notes?: string;
  }[];
  order: number;
}

export const FLEMISH_A1_GRAMMAR_NODES: GrammarNodeSeed[] = [
  // ── Nouns & Articles ──
  {
    slug: 'noun-gender-de-het',
    name: 'Noun Gender — de/het',
    nameInTarget: 'Woordgeslacht — de/het',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'Dutch nouns use either "de" (common) or "het" (neuter).',
    fullExplanation:
      'Every Dutch noun has a grammatical gender: common (de-words) or neuter (het-words). About two-thirds of nouns are de-words. There is no reliable rule to determine gender — you must learn the article with each noun. All plural nouns use "de". Examples: de man, de vrouw, het kind, het huis. Diminutives (ending in -je) are always het-words.',
    prerequisites: [],
    examples: [
      { target: 'De man is groot.', native: 'The man is tall.', highlightRange: [0, 2], notes: '"De" is the common gender article' },
      { target: 'Het huis is klein.', native: 'The house is small.', highlightRange: [0, 3], notes: '"Het" is the neuter article' },
      { target: 'De kat en het hondje.', native: 'The cat and the little dog.', highlightRange: [0, 20], notes: 'Diminutive "hondje" always takes "het"' },
    ],
    order: 0,
  },
  {
    slug: 'definite-articles',
    name: 'Definite Articles',
    nameInTarget: 'Bepaalde lidwoorden',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'De and het — the two forms of "the".',
    fullExplanation:
      'Dutch has two definite articles: "de" for common-gender nouns and all plurals, and "het" for neuter singular nouns. Unlike Spanish or French, there is no plural change in the article — all plurals use "de". Examples: de tafel (the table), het boek (the book), de boeken (the books).',
    prerequisites: ['noun-gender-de-het'],
    examples: [
      { target: 'De hond rent.', native: 'The dog runs.', highlightRange: [0, 2] },
      { target: 'Het boek is dik.', native: 'The book is thick.', highlightRange: [0, 3] },
      { target: 'De kinderen spelen.', native: 'The children play.', highlightRange: [0, 2], notes: 'All plurals take "de"' },
    ],
    order: 1,
  },
  {
    slug: 'indefinite-articles',
    name: 'Indefinite Articles',
    nameInTarget: 'Onbepaalde lidwoorden',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'Een — the form of "a/an".',
    fullExplanation:
      'Dutch has only one indefinite article: "een" (a/an), which is the same for both de-words and het-words. It is pronounced as a short, unstressed "un". There is no plural indefinite article — just omit it or use "enkele" (some). In negative sentences, "geen" (no/not any) replaces "een".',
    prerequisites: ['noun-gender-de-het'],
    examples: [
      { target: 'Ik heb een kat.', native: 'I have a cat.', highlightRange: [7, 10] },
      { target: 'Er is een probleem.', native: 'There is a problem.', highlightRange: [6, 9] },
      { target: 'Ik heb geen auto.', native: 'I don\'t have a car.', highlightRange: [7, 11], notes: '"Geen" replaces "een" in negation' },
    ],
    order: 2,
  },
  {
    slug: 'noun-plurals',
    name: 'Noun Plurals',
    nameInTarget: 'Meervoud van zelfstandige naamwoorden',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'How to form plural nouns: -en, -s, and -eren.',
    fullExplanation:
      'The most common plural ending is -en: boek → boeken, tafel → tafels. Nouns ending in -el, -em, -en, -er, -je typically take -s: appel → appels, meisje → meisjes. Some nouns use -eren: kind → kinderen, ei → eieren. Spelling changes may occur: man → mannen (doubling), huis → huizen (s→z), brief → brieven (f→v).',
    prerequisites: ['noun-gender-de-het'],
    examples: [
      { target: 'De boeken liggen op tafel.', native: 'The books are on the table.', highlightRange: [3, 9], notes: 'boek → boeken (-en ending)' },
      { target: 'De appels zijn lekker.', native: 'The apples are tasty.', highlightRange: [3, 9], notes: 'appel → appels (-s ending)' },
      { target: 'De kinderen spelen buiten.', native: 'The children play outside.', highlightRange: [3, 11], notes: 'kind → kinderen (-eren ending)' },
    ],
    order: 3,
  },

  // ── Subject Pronouns ──
  {
    slug: 'subject-pronouns',
    name: 'Subject Pronouns',
    nameInTarget: 'Persoonlijke voornaamwoorden',
    cefrLevel: 'A1',
    category: 'pronouns',
    shortDescription: 'Ik, jij, hij, zij, wij, jullie, zij.',
    fullExplanation:
      'Dutch subject pronouns: ik (I), jij/je (you informal), hij (he), zij/ze (she), het (it), u (you formal), wij/we (we), jullie (you all), zij/ze (they). The short forms (je, ze, we) are used in everyday speech. In Flemish, "gij/ge" is commonly used as an informal second person instead of "jij".',
    prerequisites: [],
    examples: [
      { target: 'Ik spreek Nederlands.', native: 'I speak Dutch.', highlightRange: [0, 2] },
      { target: 'Zij is mijn zus.', native: 'She is my sister.', highlightRange: [0, 3] },
      { target: 'Wij wonen in Brussel.', native: 'We live in Brussels.', highlightRange: [0, 3] },
    ],
    order: 4,
  },

  // ── Zijn & Hebben ──
  {
    slug: 'zijn-present',
    name: 'Zijn — Present Tense',
    nameInTarget: 'Zijn in de tegenwoordige tijd',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to be" — zijn.',
    fullExplanation:
      'Zijn (to be) is irregular and one of the most important verbs. Conjugation: ik ben, jij bent (ben jij?), hij/zij/het is, wij zijn, jullie zijn, zij zijn, u bent. It is used for identity (Ik ben Jan), characteristics (Het is mooi), profession (Zij is lerares), nationality (Wij zijn Belgen), and location in some contexts.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Ik ben student.', native: 'I am a student.', highlightRange: [3, 6] },
      { target: 'Zij zijn Belgen.', native: 'They are Belgian.', highlightRange: [4, 8] },
      { target: 'Het is twee uur.', native: 'It is two o\'clock.', highlightRange: [4, 6] },
    ],
    order: 5,
  },
  {
    slug: 'hebben-present',
    name: 'Hebben — Present Tense',
    nameInTarget: 'Hebben in de tegenwoordige tijd',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to have" — hebben.',
    fullExplanation:
      'Hebben (to have) is irregular. Conjugation: ik heb, jij hebt (heb jij?), hij/zij/het heeft, wij hebben, jullie hebben, zij hebben, u heeft/hebt. Note: when "jij" follows the verb in a question, the -t is dropped: "Heb jij?" not "Hebt jij?". Hebben is also used as an auxiliary in the perfect tense.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Ik heb een hond.', native: 'I have a dog.', highlightRange: [3, 6] },
      { target: 'Zij heeft twee katten.', native: 'She has two cats.', highlightRange: [4, 9] },
      { target: 'Heb jij een fiets?', native: 'Do you have a bicycle?', highlightRange: [0, 3], notes: 'No -t when jij follows the verb' },
    ],
    order: 6,
  },

  // ── Regular Verb Conjugation ──
  {
    slug: 'regular-verbs-present',
    name: 'Regular Verbs — Present Tense',
    nameInTarget: 'Regelmatige werkwoorden in de tegenwoordige tijd',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs: stem + endings.',
    fullExplanation:
      'To conjugate a regular verb: find the stem by removing -en from the infinitive (werken → werk). Then: ik + stem (ik werk), jij + stem + t (jij werkt), but stem only in questions with jij after the verb (werk jij?), hij/zij + stem + t (hij werkt), wij/jullie/zij + infinitive (wij werken). Spelling rules apply: double consonants simplify (pakken → pak), single vowels double in open syllables (maken → ik maak).',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Ik werk in Antwerpen.', native: 'I work in Antwerp.', highlightRange: [3, 7], notes: 'stem only for ik' },
      { target: 'Hij fietst naar school.', native: 'He cycles to school.', highlightRange: [4, 10], notes: 'stem + t for hij' },
      { target: 'Wij wonen in Gent.', native: 'We live in Ghent.', highlightRange: [4, 9], notes: 'infinitive form for wij' },
    ],
    order: 7,
  },

  // ── Separable Verbs ──
  {
    slug: 'separable-verbs',
    name: 'Separable Verbs',
    nameInTarget: 'Scheidbare werkwoorden',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Verbs like opstaan, meebrengen — the prefix separates.',
    fullExplanation:
      'Many Dutch verbs have a separable prefix (op, aan, mee, uit, af, etc.). In main clauses, the prefix moves to the end: "Ik sta op om zeven uur" (I get up at seven). Common separable verbs: opstaan (get up), aankomen (arrive), meebrengen (bring along), uitgaan (go out), opbellen (call up). The prefix stays attached in subordinate clauses and infinitive constructions.',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'Ik sta elke dag vroeg op.', native: 'I get up early every day.', highlightRange: [3, 5], notes: '"op" moves to the end' },
      { target: 'Zij brengt een taart mee.', native: 'She brings a cake along.', highlightRange: [4, 10], notes: '"mee" at the end' },
      { target: 'Wij gaan vanavond uit.', native: 'We go out tonight.', highlightRange: [4, 8], notes: '"uit" at the end' },
    ],
    order: 8,
  },

  // ── Adjective Agreement ──
  {
    slug: 'adjective-agreement',
    name: 'Adjective Agreement',
    nameInTarget: 'Bijvoeglijke naamwoorden — verbuiging',
    cefrLevel: 'A1',
    category: 'adjectives',
    shortDescription: 'When adjectives get the -e ending and when they don\'t.',
    fullExplanation:
      'Attributive adjectives (before the noun) usually take an -e ending: de grote man, de kleine kat, het grote huis. Exception: no -e with het-words in singular indefinite: een groot huis (NOT een grote huis), but een grote man (de-word, so -e applies). Predicative adjectives (after the verb) never take -e: Het huis is groot. De man is groot.',
    prerequisites: ['noun-gender-de-het', 'noun-plurals'],
    examples: [
      { target: 'De oude man loopt.', native: 'The old man walks.', highlightRange: [3, 7], notes: 'de-word: always -e' },
      { target: 'Een klein huis.', native: 'A small house.', highlightRange: [4, 9], notes: 'het-word + een: no -e' },
      { target: 'Het grote huis.', native: 'The big house.', highlightRange: [4, 9], notes: 'het + definite: -e applies' },
    ],
    order: 9,
  },

  // ── Question Words ──
  {
    slug: 'question-words',
    name: 'Question Words',
    nameInTarget: 'Vraagwoorden',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Wie, wat, waar, wanneer, hoe, waarom.',
    fullExplanation:
      'Dutch question words: wie? (who?), wat? (what?), waar? (where?), wanneer? (when?), hoe? (how?), waarom? (why?), welk/welke? (which?), hoeveel? (how much/many?). In questions, the verb comes second (after the question word), and the subject follows the verb: "Waar woon je?" (Where do you live?).',
    prerequisites: ['zijn-present', 'hebben-present'],
    examples: [
      { target: 'Waar woon je?', native: 'Where do you live?', highlightRange: [0, 4] },
      { target: 'Hoeveel kost het?', native: 'How much does it cost?', highlightRange: [0, 7] },
      { target: 'Waarom leer je Nederlands?', native: 'Why do you learn Dutch?', highlightRange: [0, 6] },
    ],
    order: 10,
  },

  // ── Negation ──
  {
    slug: 'negation-niet-geen',
    name: 'Negation — niet vs geen',
    nameInTarget: 'Ontkenning — niet en geen',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Make sentences negative with "niet" or "geen".',
    fullExplanation:
      'Dutch uses two negation words: "niet" (not) and "geen" (no/not any). Use "geen" before indefinite nouns (replacing een): Ik heb een auto → Ik heb geen auto. Use "niet" in all other cases: to negate verbs (Ik werk niet), adjectives (niet groot), adverbs, and definite nouns (Ik ken de man niet). "Niet" generally goes at the end or before the element being negated.',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'Ik spreek niet Frans.', native: 'I don\'t speak French.', highlightRange: [10, 14] },
      { target: 'Ik heb geen geld.', native: 'I don\'t have money.', highlightRange: [7, 11], notes: '"Geen" replaces "een" or zero article' },
      { target: 'Zij is niet hier.', native: 'She isn\'t here.', highlightRange: [7, 11] },
    ],
    order: 11,
  },

  // ── Er is / Er zijn ──
  {
    slug: 'er-is-er-zijn',
    name: 'Er is / Er zijn — There Is / There Are',
    nameInTarget: 'Er is / Er zijn',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express existence with "er is" and "er zijn".',
    fullExplanation:
      '"Er is" means "there is" (singular) and "er zijn" means "there are" (plural). Unlike English, Dutch distinguishes singular and plural: Er is een probleem (There is a problem), Er zijn veel mensen (There are many people). Questions: Is er...? / Zijn er...? Negative: Er is geen... / Er zijn geen...',
    prerequisites: ['definite-articles', 'indefinite-articles'],
    examples: [
      { target: 'Er is een park hier.', native: 'There is a park here.', highlightRange: [0, 5] },
      { target: 'Er zijn veel winkels.', native: 'There are many shops.', highlightRange: [0, 7] },
      { target: 'Is er een toilet?', native: 'Is there a toilet?', highlightRange: [0, 5] },
    ],
    order: 12,
  },

  // ── Word Order V2 ──
  {
    slug: 'word-order-v2',
    name: 'Word Order — V2 Rule',
    nameInTarget: 'Woordvolgorde — werkwoord op de tweede plaats',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'The conjugated verb always comes second in main clauses.',
    fullExplanation:
      'In Dutch main clauses, the conjugated verb must be the second element (V2 rule). The first position can be the subject or another element (time, place, etc.). When a non-subject starts the sentence, the subject and verb invert: "Ik werk vandaag" → "Vandaag werk ik" (Today I work). This inversion is mandatory and one of the most important rules in Dutch.',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'Vandaag werk ik thuis.', native: 'Today I work at home.', highlightRange: [9, 13], notes: 'Verb is second; subject inverts' },
      { target: 'Morgen ga ik naar Brussel.', native: 'Tomorrow I go to Brussels.', highlightRange: [7, 9], notes: '"ga" is the second element' },
      { target: 'In de zomer zwemmen wij.', native: 'In summer we swim.', highlightRange: [14, 21], notes: 'Verb second after prepositional phrase' },
    ],
    order: 13,
  },

  // ── Diminutives ──
  {
    slug: 'diminutives',
    name: 'Diminutives',
    nameInTarget: 'Verkleinwoorden',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'Make things small or cute with -je, -tje, -pje, etc.',
    fullExplanation:
      'Diminutives are extremely common in Dutch, especially in Flemish. They express smallness, endearment, or casualness. All diminutives are het-words. The basic suffix is -je, but it changes based on the final sound: -tje after long vowel + l, n, r (stoeltje), -pje after m (bloempje), -etje after certain short vowels (balletje), -kje after -ing (konininkje). Diminutives are used far more often in Dutch than in most languages.',
    prerequisites: ['noun-gender-de-het'],
    examples: [
      { target: 'Het hondje is lief.', native: 'The little dog is sweet.', highlightRange: [4, 10], notes: 'hond → hondje' },
      { target: 'Wil je een kopje koffie?', native: 'Would you like a cup of coffee?', highlightRange: [14, 19], notes: 'kop → kopje' },
      { target: 'Het bloemetje is mooi.', native: 'The little flower is pretty.', highlightRange: [4, 13], notes: 'bloem → bloemetje' },
    ],
    order: 14,
  },

  // ── Modal Verbs ──
  {
    slug: 'modal-verbs',
    name: 'Modal Verbs',
    nameInTarget: 'Modale werkwoorden',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Kunnen, willen, moeten, mogen — ability, desire, obligation, permission.',
    fullExplanation:
      'Modal verbs express ability, desire, obligation, or permission. They are followed by an infinitive at the end of the clause. Kunnen (can): ik kan, jij kunt/kan. Willen (want): ik wil, jij wilt/wil. Moeten (must): ik moet, jij moet. Mogen (may): ik mag, jij mag. The infinitive goes to the end: "Ik kan goed zwemmen" (I can swim well).',
    prerequisites: ['regular-verbs-present'],
    examples: [
      { target: 'Ik kan Nederlands spreken.', native: 'I can speak Dutch.', highlightRange: [3, 6], notes: 'Modal "kan" + infinitive at end' },
      { target: 'Wij moeten werken.', native: 'We must work.', highlightRange: [4, 10] },
      { target: 'Mag ik hier zitten?', native: 'May I sit here?', highlightRange: [0, 3], notes: '"Mag" for permission' },
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
