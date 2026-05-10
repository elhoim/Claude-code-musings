/**
 * Spanish A1 Grammar Graph Seed Data
 * Grammar nodes and prerequisite edges for the A1 level
 */

import type { GrammarNodeSeed } from './grammar-seed-types';
export { buildGrammarEdges } from './grammar-seed-types';
export type { GrammarNodeSeed } from './grammar-seed-types';

export const SPANISH_A1_GRAMMAR_NODES: GrammarNodeSeed[] = [
  // ── Nouns & Articles ──
  {
    slug: 'gender-nouns',
    name: 'Noun Gender',
    nameInTarget: 'Género de sustantivos',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'Spanish nouns are masculine or feminine.',
    fullExplanation:
      'Every Spanish noun has a grammatical gender: masculine or feminine. Most nouns ending in -o are masculine (el libro), and most ending in -a are feminine (la mesa). There are exceptions: el día, la mano. Knowing the gender is essential because articles and adjectives must agree.',
    prerequisites: [],
    examples: [
      { target: 'El libro es nuevo.', native: 'The book is new.', highlightRange: [0, 2], notes: '"El" is the masculine article' },
      { target: 'La casa es grande.', native: 'The house is big.', highlightRange: [0, 2], notes: '"La" is the feminine article' },
      { target: 'El gato y la gata.', native: 'The male cat and the female cat.', highlightRange: [0, 19] },
    ],
    order: 0,
  },
  {
    slug: 'definite-articles',
    name: 'Definite Articles',
    nameInTarget: 'Artículos definidos',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'El, la, los, las — the four forms of "the".',
    fullExplanation:
      'Spanish has four definite articles: el (masculine singular), la (feminine singular), los (masculine plural), las (feminine plural). They must match the gender and number of the noun they accompany.',
    prerequisites: ['gender-nouns'],
    examples: [
      { target: 'El perro corre.', native: 'The dog runs.', highlightRange: [0, 2] },
      { target: 'La flor es roja.', native: 'The flower is red.', highlightRange: [0, 2] },
      { target: 'Los niños juegan.', native: 'The children play.', highlightRange: [0, 3] },
      { target: 'Las casas son blancas.', native: 'The houses are white.', highlightRange: [0, 3] },
    ],
    order: 1,
  },
  {
    slug: 'indefinite-articles',
    name: 'Indefinite Articles',
    nameInTarget: 'Artículos indefinidos',
    cefrLevel: 'A1',
    category: 'articles',
    shortDescription: 'Un, una, unos, unas — the forms of "a/an/some".',
    fullExplanation:
      'Indefinite articles in Spanish are: un (masculine singular), una (feminine singular), unos (masculine plural), unas (feminine plural). They are used when referring to non-specific nouns, similar to "a", "an", or "some" in English.',
    prerequisites: ['gender-nouns'],
    examples: [
      { target: 'Tengo un gato.', native: 'I have a cat.', highlightRange: [6, 8] },
      { target: 'Necesito una mesa.', native: 'I need a table.', highlightRange: [9, 12] },
      { target: 'Hay unos libros aquí.', native: 'There are some books here.', highlightRange: [4, 8] },
    ],
    order: 2,
  },
  {
    slug: 'noun-plurals',
    name: 'Noun Plurals',
    nameInTarget: 'Plurales',
    cefrLevel: 'A1',
    category: 'nouns',
    shortDescription: 'How to form plural nouns in Spanish.',
    fullExplanation:
      'To form plurals: add -s to nouns ending in a vowel (libro → libros), add -es to nouns ending in a consonant (ciudad → ciudades). Nouns ending in -z change to -ces (lápiz → lápices). The article must also change to plural form.',
    prerequisites: ['gender-nouns'],
    examples: [
      { target: 'Los libros están aquí.', native: 'The books are here.', highlightRange: [4, 10] },
      { target: 'Las ciudades son grandes.', native: 'The cities are big.', highlightRange: [4, 12] },
    ],
    order: 3,
  },

  // ── Subject Pronouns ──
  {
    slug: 'subject-pronouns',
    name: 'Subject Pronouns',
    nameInTarget: 'Pronombres personales',
    cefrLevel: 'A1',
    category: 'pronouns',
    shortDescription: 'Yo, tú, él, ella, nosotros, ellos…',
    fullExplanation:
      'Spanish subject pronouns: yo (I), tú (you informal), él (he), ella (she), usted (you formal), nosotros/as (we), vosotros/as (you all, Spain), ellos/as (they), ustedes (you all). Subject pronouns are often omitted because the verb ending indicates the subject.',
    prerequisites: [],
    examples: [
      { target: 'Yo hablo español.', native: 'I speak Spanish.', highlightRange: [0, 2] },
      { target: 'Ella es doctora.', native: 'She is a doctor.', highlightRange: [0, 4] },
      { target: 'Nosotros estudiamos.', native: 'We study.', highlightRange: [0, 8] },
    ],
    order: 4,
  },

  // ── Ser & Estar ──
  {
    slug: 'ser-present',
    name: 'Ser — Present Tense',
    nameInTarget: 'Ser en presente',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to be" for identity, origin, and characteristics.',
    fullExplanation:
      'Ser is used for: identity (Soy María), nationality/origin (Soy de España), occupation (Es profesor), characteristics (Es alto), time (Son las tres), material (Es de madera). Conjugation: soy, eres, es, somos, sois, son.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Yo soy estudiante.', native: 'I am a student.', highlightRange: [3, 6] },
      { target: 'Ellos son mexicanos.', native: 'They are Mexican.', highlightRange: [6, 9] },
      { target: 'Es la una de la tarde.', native: "It's one in the afternoon.", highlightRange: [0, 2] },
    ],
    order: 5,
  },
  {
    slug: 'estar-present',
    name: 'Estar — Present Tense',
    nameInTarget: 'Estar en presente',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'The verb "to be" for location, feelings, and states.',
    fullExplanation:
      'Estar is used for: location (Estoy en casa), temporary states (Estoy cansado), emotions (Está feliz), health (¿Cómo estás?). Conjugation: estoy, estás, está, estamos, estáis, están.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Estoy en la escuela.', native: 'I am at school.', highlightRange: [0, 5] },
      { target: '¿Cómo estás?', native: 'How are you?', highlightRange: [6, 11] },
      { target: 'Ella está contenta.', native: 'She is happy.', highlightRange: [5, 9] },
    ],
    order: 6,
  },

  // ── Regular Verb Conjugation ──
  {
    slug: 'ar-verbs-present',
    name: '-AR Verbs Present Tense',
    nameInTarget: 'Verbos -AR en presente',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs ending in -ar.',
    fullExplanation:
      'Regular -AR verbs drop the -ar and add endings: -o (yo), -as (tú), -a (él/ella/usted), -amos (nosotros), -áis (vosotros), -an (ellos/ustedes). Examples: hablar, trabajar, estudiar, cocinar, comprar.',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Yo hablo español.', native: 'I speak Spanish.', highlightRange: [3, 8], notes: 'habl + o' },
      { target: 'Ella trabaja mucho.', native: 'She works a lot.', highlightRange: [5, 12], notes: 'trabaj + a' },
      { target: 'Nosotros estudiamos juntos.', native: 'We study together.', highlightRange: [9, 19], notes: 'estudi + amos' },
    ],
    order: 7,
  },
  {
    slug: 'er-ir-verbs-present',
    name: '-ER/-IR Verbs Present Tense',
    nameInTarget: 'Verbos -ER/-IR en presente',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Conjugate regular verbs ending in -er and -ir.',
    fullExplanation:
      '-ER verbs: -o, -es, -e, -emos, -éis, -en (comer, beber, leer). -IR verbs: -o, -es, -e, -imos, -ís, -en (vivir, escribir). The only difference between -ER and -IR is in the nosotros and vosotros forms.',
    prerequisites: ['ar-verbs-present'],
    examples: [
      { target: 'Yo como arroz.', native: 'I eat rice.', highlightRange: [3, 7], notes: 'com + o' },
      { target: 'Tú vives en Madrid.', native: 'You live in Madrid.', highlightRange: [3, 8], notes: 'viv + es' },
      { target: 'Nosotros escribimos cartas.', native: 'We write letters.', highlightRange: [9, 19], notes: 'escrib + imos' },
    ],
    order: 8,
  },

  // ── Tener & Hay ──
  {
    slug: 'tener-present',
    name: 'Tener — Present Tense',
    nameInTarget: 'Tener en presente',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: '"To have" — also used for age, hunger, thirst.',
    fullExplanation:
      'Tener means "to have" and is irregular: tengo, tienes, tiene, tenemos, tenéis, tienen. It\'s also used in expressions where English uses "to be": tener hambre (to be hungry), tener sed (thirsty), tener frío (cold), tener calor (hot), tener años (to be X years old), tener sueño (sleepy).',
    prerequisites: ['subject-pronouns'],
    examples: [
      { target: 'Tengo 25 años.', native: 'I am 25 years old.', highlightRange: [0, 5] },
      { target: 'Ella tiene hambre.', native: 'She is hungry.', highlightRange: [5, 10] },
      { target: 'Tenemos dos gatos.', native: 'We have two cats.', highlightRange: [0, 7] },
    ],
    order: 9,
  },
  {
    slug: 'hay-existential',
    name: 'Hay — There Is / There Are',
    nameInTarget: 'Hay',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express existence with "hay".',
    fullExplanation:
      '"Hay" means "there is" or "there are". It\'s an impersonal form of haber and does not change for singular or plural. Use it to talk about existence or availability: Hay un parque (There is a park), Hay muchos libros (There are many books). Questions: ¿Hay…? Negative: No hay…',
    prerequisites: ['definite-articles', 'indefinite-articles'],
    examples: [
      { target: 'Hay un gato en la mesa.', native: 'There is a cat on the table.', highlightRange: [0, 3] },
      { target: '¿Hay leche?', native: 'Is there milk?', highlightRange: [1, 4] },
      { target: 'No hay problema.', native: 'There is no problem.', highlightRange: [3, 6] },
    ],
    order: 10,
  },

  // ── Adjective Agreement ──
  {
    slug: 'adjective-agreement',
    name: 'Adjective Agreement',
    nameInTarget: 'Concordancia de adjetivos',
    cefrLevel: 'A1',
    category: 'adjectives',
    shortDescription: 'Adjectives must agree in gender and number with nouns.',
    fullExplanation:
      'In Spanish, adjectives change form to agree with the noun they describe. Most adjectives ending in -o have four forms: -o (masc sing), -a (fem sing), -os (masc pl), -as (fem pl). Adjectives ending in -e or a consonant usually only change for number. Adjectives typically come after the noun.',
    prerequisites: ['gender-nouns', 'noun-plurals'],
    examples: [
      { target: 'El gato negro.', native: 'The black cat.', highlightRange: [9, 14] },
      { target: 'La casa blanca.', native: 'The white house.', highlightRange: [8, 14] },
      { target: 'Los libros nuevos.', native: 'The new books.', highlightRange: [11, 17] },
    ],
    order: 11,
  },

  // ── Questions ──
  {
    slug: 'question-words',
    name: 'Question Words',
    nameInTarget: 'Palabras interrogativas',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: '¿Qué? ¿Quién? ¿Dónde? ¿Cuándo? ¿Cómo? ¿Cuánto?',
    fullExplanation:
      'Spanish question words always have a written accent: ¿Qué? (What?), ¿Quién? (Who?), ¿Dónde? (Where?), ¿Cuándo? (When?), ¿Cómo? (How?), ¿Cuánto/a/os/as? (How much/many?), ¿Por qué? (Why?), ¿Cuál? (Which?). Questions use inverted question marks at the beginning.',
    prerequisites: ['ser-present', 'estar-present'],
    examples: [
      { target: '¿Dónde vives?', native: 'Where do you live?', highlightRange: [1, 6] },
      { target: '¿Cuántos años tienes?', native: 'How old are you?', highlightRange: [1, 8] },
      { target: '¿Por qué estudias español?', native: 'Why do you study Spanish?', highlightRange: [1, 8] },
    ],
    order: 12,
  },

  // ── Ir + a + Infinitive ──
  {
    slug: 'ir-a-infinitive',
    name: 'Ir + a + Infinitive',
    nameInTarget: 'Ir + a + infinitivo',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express future plans: "I am going to…"',
    fullExplanation:
      'To express near future plans, use ir (to go) conjugated + a + infinitive. Ir conjugation: voy, vas, va, vamos, vais, van. Example: Voy a estudiar (I\'m going to study). This construction is the most common way to talk about the future in everyday Spanish.',
    prerequisites: ['ar-verbs-present'],
    examples: [
      { target: 'Voy a comer pizza.', native: "I'm going to eat pizza.", highlightRange: [0, 5] },
      { target: 'Ellos van a viajar.', native: 'They are going to travel.', highlightRange: [6, 12] },
      { target: '¿Vas a estudiar hoy?', native: 'Are you going to study today?', highlightRange: [1, 11] },
    ],
    order: 13,
  },

  // ── Negation ──
  {
    slug: 'negation',
    name: 'Negation',
    nameInTarget: 'La negación',
    cefrLevel: 'A1',
    category: 'syntax',
    shortDescription: 'Make sentences negative with "no".',
    fullExplanation:
      'To negate a sentence in Spanish, place "no" before the conjugated verb: Hablo español → No hablo español. For questions: ¿No hablas español? Double negation is standard in Spanish: No tengo nada (I don\'t have anything). No…nunca (never), no…nadie (nobody), no…tampoco (neither).',
    prerequisites: ['ar-verbs-present'],
    examples: [
      { target: 'No hablo francés.', native: "I don't speak French.", highlightRange: [0, 2] },
      { target: 'No tengo nada.', native: "I don't have anything.", highlightRange: [0, 2] },
      { target: 'Ella no está aquí.', native: "She isn't here.", highlightRange: [5, 7] },
    ],
    order: 14,
  },

  // ── Gustar ──
  {
    slug: 'gustar',
    name: 'Gustar — Likes & Dislikes',
    nameInTarget: 'El verbo gustar',
    cefrLevel: 'A1',
    category: 'verbs',
    shortDescription: 'Express likes: "Me gusta" / "Me gustan".',
    fullExplanation:
      'Gustar works differently from English "to like". The subject is the thing liked, and the person who likes uses an indirect object pronoun: me gusta (I like), te gusta (you like), le gusta (he/she likes), nos gusta (we like), les gusta (they like). Use "gusta" with singular nouns/infinitives, "gustan" with plural nouns.',
    prerequisites: ['definite-articles', 'subject-pronouns'],
    examples: [
      { target: 'Me gusta el café.', native: 'I like coffee.', highlightRange: [0, 8] },
      { target: 'Me gustan los gatos.', native: 'I like cats.', highlightRange: [0, 9] },
      { target: 'No me gusta bailar.', native: "I don't like dancing.", highlightRange: [3, 11] },
    ],
    order: 15,
  },
];

