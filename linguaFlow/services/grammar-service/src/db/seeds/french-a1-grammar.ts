/**
 * French A1 Grammar Graph Seed Data
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
  prerequisites: string[];
  examples: {
    target: string;
    native: string;
    highlightRange: [number, number];
    notes?: string;
  }[];
  order: number;
}

export const FRENCH_A1_GRAMMAR_NODES: GrammarNodeSeed[] = [
  // ── Nouns & Articles ──
  {
    slug: 'gender-nouns',
    name: 'Noun Gender',
    nameInTarget: 'Genre des noms',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'French nouns are masculine or feminine.',
    fullExplanation:
      'Every French noun has a grammatical gender: masculine (masculin) or feminine (féminin). There are patterns but many exceptions. Nouns ending in -tion, -sion, -eur (abstract) tend to be feminine. Nouns ending in -ment, -age, -eau tend to be masculine. Knowing the gender is essential because articles and adjectives must agree.',
    prerequisites: [],
    examples: [
      { target: 'Le livre est nouveau.', native: 'The book is new.', highlightRange: [0, 2], notes: '"Le" is the masculine article' },
      { target: 'La maison est grande.', native: 'The house is big.', highlightRange: [0, 2], notes: '"La" is the feminine article' },
      { target: 'Le chat et la chatte.', native: 'The male cat and the female cat.', highlightRange: [0, 21] },
    ],
    order: 0,
  },
  {
    slug: 'definite-articles',
    name: 'Definite Articles',
    nameInTarget: 'Articles définis',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: "Le, la, l', les — the forms of \"the\".",
    fullExplanation:
      "French has four definite articles: le (masculine singular), la (feminine singular), l' (before a vowel or silent h), les (plural). They must match the gender and number of the noun.",
    prerequisites: ['gender-nouns'],
    examples: [
      { target: 'Le chien court.', native: 'The dog runs.', highlightRange: [0, 2] },
      { target: 'La fleur est rouge.', native: 'The flower is red.', highlightRange: [0, 2] },
      { target: "L'école est fermée.", native: 'The school is closed.', highlightRange: [0, 2], notes: "L' before a vowel" },
      { target: 'Les enfants jouent.', native: 'The children play.', highlightRange: [0, 3] },
    ],
    order: 1,
  },
  {
    slug: 'indefinite-articles',
    name: 'Indefinite Articles',
    nameInTarget: 'Articles indéfinis',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'Un, une, des — the forms of "a/an/some".',
    fullExplanation:
      'Indefinite articles in French are: un (masculine singular), une (feminine singular), des (plural, meaning "some"). They are used when referring to non-specific nouns.',
    prerequisites: ['gender-nouns'],
    examples: [
      { target: "J'ai un chat.", native: 'I have a cat.', highlightRange: [5, 7] },
      { target: 'Je veux une table.', native: 'I want a table.', highlightRange: [8, 11] },
      { target: 'Il y a des livres ici.', native: 'There are some books here.', highlightRange: [8, 11] },
    ],
    order: 2,
  },
  {
    slug: 'noun-plurals',
    name: 'Noun Plurals',
    nameInTarget: 'Pluriel des noms',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'How to form plural nouns in French.',
    fullExplanation:
      'To form plurals: add -s to most nouns (livre → livres). Nouns ending in -eau add -x (gâteau → gâteaux). Nouns ending in -al change to -aux (journal → journaux). Nouns already ending in -s, -x, or -z remain unchanged (voix → voix).',
    prerequisites: ['gender-nouns'],
    examples: [
      { target: 'Les livres sont ici.', native: 'The books are here.', highlightRange: [4, 10] },
      { target: 'Les gâteaux sont bons.', native: 'The cakes are good.', highlightRange: [4, 11] },
    ],
    order: 3,
  },

  // ── Subject Pronouns ──
  {
    slug: 'subject-pronouns',
    name: 'Subject Pronouns',
    nameInTarget: 'Pronoms personnels sujets',
    cefrLevel: 'A1',
    category: 'pronouns',
    shortDescription: 'Je, tu, il, elle, nous, vous, ils, elles…',
    fullExplanation:
      "French subject pronouns: je (I), tu (you informal), il (he), elle (she), on (one/we informal), nous (we), vous (you formal/plural), ils (they masc.), elles (they fem.). Unlike Spanish, subject pronouns are always required in French.",
    prerequisites: [],
    examples: [
      { target: 'Je parle français.', native: 'I speak French.', highlightRange: [0, 2] },
      { target: 'Elle est médecin.', native: 'She is a doctor.', highlightRange: [0, 4] },
      { target: 'Nous étudions.', native: 'We study.', highlightRange: [0, 4] },
    ],
    order: 4,
  },

  // ── Être & Avoir ──
  {
    slug: 'etre-present',
    name: 'Être — Present Tense',
    nameInTarget: 'Être au présent',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to be" — identity, origin, and characteristics.',
    fullExplanation:
      "Être is one of the most important French verbs. It's used for identity (Je suis Marie), nationality (Je suis français), occupation (Il est professeur), characteristics (Elle est grande), and time (Il est trois heures). Conjugation: suis, es, est, sommes, êtes, sont.",
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Je suis étudiant.', native: 'I am a student.', highlightRange: [3, 7] },
      { target: 'Ils sont français.', native: 'They are French.', highlightRange: [4, 8] },
      { target: 'Il est trois heures.', native: "It's three o'clock.", highlightRange: [3, 6] },
    ],
    order: 5,
  },
  {
    slug: 'avoir-present',
    name: 'Avoir — Present Tense',
    nameInTarget: 'Avoir au présent',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to have" — also used for age, hunger, thirst.',
    fullExplanation:
      "Avoir means \"to have\" and is irregular: ai, as, a, avons, avez, ont. It's also used in many expressions where English uses \"to be\": avoir faim (to be hungry), avoir soif (thirsty), avoir froid (cold), avoir chaud (hot), avoir … ans (to be X years old), avoir sommeil (sleepy), avoir peur (afraid).",
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: "J'ai 25 ans.", native: 'I am 25 years old.', highlightRange: [2, 4] },
      { target: 'Elle a faim.', native: 'She is hungry.', highlightRange: [5, 6] },
      { target: 'Nous avons deux chats.', native: 'We have two cats.', highlightRange: [5, 10] },
    ],
    order: 6,
  },

  // ── Regular Verb Conjugation ──
  {
    slug: 'er-verbs-present',
    name: '-ER Verbs Present Tense',
    nameInTarget: 'Verbes -ER au présent',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs ending in -er.',
    fullExplanation:
      'Regular -ER verbs (the largest group) drop the -er and add endings: -e (je), -es (tu), -e (il/elle/on), -ons (nous), -ez (vous), -ent (ils/elles). Examples: parler, travailler, étudier, cuisiner, acheter. Note: je + vowel → j\'.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Je parle français.', native: 'I speak French.', highlightRange: [3, 8], notes: 'parl + e' },
      { target: 'Elle travaille beaucoup.', native: 'She works a lot.', highlightRange: [5, 14], notes: 'travaill + e' },
      { target: 'Nous étudions ensemble.', native: 'We study together.', highlightRange: [5, 13], notes: 'étudi + ons' },
    ],
    order: 7,
  },
  {
    slug: 'ir-verbs-present',
    name: '-IR Verbs Present Tense',
    nameInTarget: 'Verbes -IR au présent',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs ending in -ir.',
    fullExplanation:
      'Regular -IR verbs (2nd group) add -iss- in plural forms: -is (je), -is (tu), -it (il/elle), -issons (nous), -issez (vous), -issent (ils/elles). Examples: finir, choisir, réussir, remplir, grandir.',
    prerequisites: ['er-verbs-present'],
    examples: [
      { target: 'Je finis mon travail.', native: 'I finish my work.', highlightRange: [3, 8], notes: 'fin + is' },
      { target: 'Nous choisissons un livre.', native: 'We choose a book.', highlightRange: [5, 16], notes: 'chois + issons' },
      { target: 'Ils finissent tôt.', native: 'They finish early.', highlightRange: [4, 13], notes: 'fin + issent' },
    ],
    order: 8,
  },
  {
    slug: 're-verbs-present',
    name: '-RE Verbs Present Tense',
    nameInTarget: 'Verbes -RE au présent',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs ending in -re.',
    fullExplanation:
      'Regular -RE verbs (3rd group) drop the -re and add: -s (je), -s (tu), nothing (il/elle), -ons (nous), -ez (vous), -ent (ils/elles). Examples: vendre, attendre, répondre, perdre, entendre.',
    prerequisites: ['er-verbs-present'],
    examples: [
      { target: 'Je vends ma voiture.', native: 'I sell my car.', highlightRange: [3, 8], notes: 'vend + s' },
      { target: 'Il attend le bus.', native: 'He waits for the bus.', highlightRange: [3, 9], notes: 'attend + nothing' },
      { target: 'Nous répondons vite.', native: 'We answer quickly.', highlightRange: [5, 14], notes: 'répond + ons' },
    ],
    order: 9,
  },

  // ── Adjective Agreement ──
  {
    slug: 'adjective-agreement',
    name: 'Adjective Agreement',
    nameInTarget: "Accord de l'adjectif",
    cefrLevel: 'A1',
    category: 'adjectives',
    shortDescription: 'Adjectives must agree in gender and number with nouns.',
    fullExplanation:
      'In French, adjectives change form to agree with the noun: add -e for feminine (grand → grande), add -s for plural (grand → grands), add -es for feminine plural (grand → grandes). Adjectives ending in -e stay the same for feminine. Most adjectives come after the noun, but some common ones (petit, grand, bon, beau, nouveau, vieux, jeune) come before.',
    prerequisites: ['gender-nouns', 'noun-plurals'],
    examples: [
      { target: 'Le chat noir.', native: 'The black cat.', highlightRange: [8, 12] },
      { target: 'La maison blanche.', native: 'The white house.', highlightRange: [10, 17] },
      { target: 'Les livres nouveaux.', native: 'The new books.', highlightRange: [11, 19] },
    ],
    order: 10,
  },

  // ── Questions ──
  {
    slug: 'question-words',
    name: 'Question Words',
    nameInTarget: 'Mots interrogatifs',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Qui ? Que ? Où ? Quand ? Comment ? Pourquoi ?',
    fullExplanation:
      'French question words: Qui ? (Who?), Que/Qu\'est-ce que ? (What?), Où ? (Where?), Quand ? (When?), Comment ? (How?), Combien ? (How much/many?), Pourquoi ? (Why?), Quel/Quelle ? (Which?). Questions can be formed by inversion, "est-ce que", or rising intonation.',
    prerequisites: ['etre-present', 'avoir-present'],
    examples: [
      { target: 'Où habites-tu ?', native: 'Where do you live?', highlightRange: [0, 2] },
      { target: 'Quel âge as-tu ?', native: 'How old are you?', highlightRange: [0, 8] },
      { target: 'Pourquoi études-tu le français ?', native: 'Why do you study French?', highlightRange: [0, 8] },
    ],
    order: 11,
  },

  // ── Negation ──
  {
    slug: 'negation-ne-pas',
    name: 'Negation with ne…pas',
    nameInTarget: 'La négation ne…pas',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Make sentences negative with ne…pas.',
    fullExplanation:
      'To negate a sentence in French, wrap the conjugated verb with "ne" (before) and "pas" (after): Je parle → Je ne parle pas. Before a vowel, "ne" becomes "n\'": Je n\'ai pas. Other negations: ne…jamais (never), ne…rien (nothing), ne…personne (nobody), ne…plus (no longer). In spoken French, "ne" is often dropped.',
    prerequisites: ['er-verbs-present'],
    examples: [
      { target: 'Je ne parle pas anglais.', native: "I don't speak English.", highlightRange: [3, 5] },
      { target: "Je n'ai rien.", native: "I don't have anything.", highlightRange: [3, 5] },
      { target: "Elle n'est pas ici.", native: "She isn't here.", highlightRange: [6, 8] },
    ],
    order: 12,
  },

  // ── Aller + Infinitive ──
  {
    slug: 'aller-a-infinitive',
    name: 'Aller + Infinitive',
    nameInTarget: 'Aller + infinitif',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express future plans: "I am going to…"',
    fullExplanation:
      'To express near future plans, use aller conjugated + infinitive (no preposition needed unlike Spanish). Aller conjugation: vais, vas, va, allons, allez, vont. Example: Je vais manger (I\'m going to eat). This is the futur proche, the most common way to talk about the near future.',
    prerequisites: ['er-verbs-present'],
    examples: [
      { target: 'Je vais manger une pizza.', native: "I'm going to eat a pizza.", highlightRange: [3, 7] },
      { target: 'Ils vont voyager.', native: 'They are going to travel.', highlightRange: [4, 8] },
      { target: 'Tu vas étudier ce soir ?', native: 'Are you going to study tonight?', highlightRange: [3, 6] },
    ],
    order: 13,
  },

  // ── Partitive Articles ──
  {
    slug: 'partitive-articles',
    name: 'Partitive Articles',
    nameInTarget: 'Articles partitifs',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'Du, de la, de l\' — "some" for uncountable nouns.',
    fullExplanation:
      'Partitive articles express an unspecified quantity of something (some/any): du (masculine), de la (feminine), de l\' (before vowel/silent h). In negative sentences, they become "de/d\'": Je ne bois pas de café. This concept doesn\'t exist in English but is mandatory in French.',
    prerequisites: ['definite-articles', 'indefinite-articles'],
    examples: [
      { target: 'Je bois du café.', native: 'I drink (some) coffee.', highlightRange: [8, 10] },
      { target: 'Elle mange de la salade.', native: 'She eats (some) salad.', highlightRange: [12, 17] },
      { target: "Je n'ai pas de lait.", native: "I don't have any milk.", highlightRange: [14, 16] },
    ],
    order: 14,
  },

  // ── Il y a ──
  {
    slug: 'il-y-a',
    name: 'Il y a — There Is / There Are',
    nameInTarget: 'Il y a',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express existence with "il y a".',
    fullExplanation:
      '"Il y a" means "there is" or "there are". It does not change for singular or plural. Use it to talk about existence or availability: Il y a un parc (There is a park), Il y a beaucoup de livres (There are many books). Questions: Est-ce qu\'il y a… ? / Y a-t-il… ? Negative: Il n\'y a pas de…',
    prerequisites: ['definite-articles', 'indefinite-articles'],
    examples: [
      { target: 'Il y a un chat sur la table.', native: 'There is a cat on the table.', highlightRange: [0, 6] },
      { target: 'Est-ce qu\'il y a du lait ?', native: 'Is there any milk?', highlightRange: [10, 14] },
      { target: 'Il n\'y a pas de problème.', native: 'There is no problem.', highlightRange: [3, 7] },
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
