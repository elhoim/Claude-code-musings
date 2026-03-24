/**
 * Spanish A1 Story Templates Seed Data
 * Interactive graded readers with vocabulary annotations and branching choices
 */

export interface StorySegmentSeed {
  order: number;
  text: string;
  translation: string;
  annotations: {
    startIndex: number;
    endIndex: number;
    word: string;
    definition: string;
    partOfSpeech?: string;
  }[];
  choices?: {
    id: string;
    text: string;
    translation: string;
    nextSegmentOrder: number; // resolved to actual segment IDs at seed time
  }[];
  promptForUser?: {
    type: string;
    instruction: string;
    minWords?: number;
  };
}

export interface StorySeed {
  language: string;
  cefrLevel: string;
  title: string;
  description: string;
  genre: string;
  isTemplate: boolean;
  estimatedMinutes: number;
  vocabularyTargets: string[];
  grammarTargets: string[];
  segments: StorySegmentSeed[];
}

export const SPANISH_A1_STORIES: StorySeed[] = [
  // ── Story 1: Un Día en la Ciudad ──
  {
    language: 'es',
    cefrLevel: 'A1',
    title: 'Un Día en la Ciudad',
    description: 'Follow Ana through her day exploring the city. Practice places, directions, and ordering food.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 8,
    vocabularyTargets: ['places', 'food', 'directions', 'greetings'],
    grammarTargets: ['ser-present', 'estar-present', 'ar-verbs-present'],
    segments: [
      {
        order: 0,
        text: 'Ana se levanta a las ocho de la mañana. Hoy es sábado y no tiene que trabajar.',
        translation: 'Ana wakes up at eight in the morning. Today is Saturday and she doesn\'t have to work.',
        annotations: [
          { startIndex: 4, endIndex: 16, word: 'se levanta', definition: 'wakes up / gets up', partOfSpeech: 'verb' },
          { startIndex: 22, endIndex: 26, word: 'ocho', definition: 'eight', partOfSpeech: 'number' },
          { startIndex: 33, endIndex: 39, word: 'mañana', definition: 'morning', partOfSpeech: 'noun' },
          { startIndex: 45, endIndex: 51, word: 'sábado', definition: 'Saturday', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: '— Buenos días — dice Ana. — ¿Qué hago hoy? Puedo ir al parque o al centro de la ciudad.',
        translation: '"Good morning," says Ana. "What do I do today? I can go to the park or to the city center."',
        annotations: [
          { startIndex: 2, endIndex: 13, word: 'Buenos días', definition: 'Good morning', partOfSpeech: 'greeting' },
          { startIndex: 56, endIndex: 62, word: 'parque', definition: 'park', partOfSpeech: 'noun' },
          { startIndex: 69, endIndex: 75, word: 'centro', definition: 'center / downtown', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'park', text: 'Ana va al parque.', translation: 'Ana goes to the park.', nextSegmentOrder: 2 },
          { id: 'centro', text: 'Ana va al centro.', translation: 'Ana goes downtown.', nextSegmentOrder: 4 },
        ],
      },
      // Park branch
      {
        order: 2,
        text: 'Ana camina al parque. Hay muchos árboles y flores. El parque es muy bonito. Ana se sienta en un banco cerca de la fuente.',
        translation: 'Ana walks to the park. There are many trees and flowers. The park is very pretty. Ana sits on a bench near the fountain.',
        annotations: [
          { startIndex: 4, endIndex: 10, word: 'camina', definition: 'walks', partOfSpeech: 'verb' },
          { startIndex: 26, endIndex: 33, word: 'árboles', definition: 'trees', partOfSpeech: 'noun' },
          { startIndex: 36, endIndex: 42, word: 'flores', definition: 'flowers', partOfSpeech: 'noun' },
          { startIndex: 60, endIndex: 66, word: 'bonito', definition: 'pretty / beautiful', partOfSpeech: 'adjective' },
        ],
      },
      {
        order: 3,
        text: 'Un chico se acerca. — ¡Hola! Me llamo Carlos. ¿Cómo te llamas? — Soy Ana, mucho gusto. — ¿Quieres un café? Hay una cafetería cerca.',
        translation: 'A guy comes over. "Hi! My name is Carlos. What\'s your name?" "I\'m Ana, nice to meet you." "Want a coffee? There\'s a café nearby."',
        annotations: [
          { startIndex: 3, endIndex: 8, word: 'chico', definition: 'boy / guy', partOfSpeech: 'noun' },
          { startIndex: 32, endIndex: 37, word: 'llamo', definition: 'I am called / my name is', partOfSpeech: 'verb' },
          { startIndex: 79, endIndex: 83, word: 'café', definition: 'coffee', partOfSpeech: 'noun' },
          { startIndex: 94, endIndex: 103, word: 'cafetería', definition: 'café / coffee shop', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'How would you introduce yourself? Write a short response in Spanish.',
          minWords: 3,
        },
      },
      // Downtown branch
      {
        order: 4,
        text: 'Ana toma el autobús al centro. La ciudad está llena de gente. Hay tiendas, restaurantes y un gran mercado.',
        translation: 'Ana takes the bus downtown. The city is full of people. There are shops, restaurants, and a big market.',
        annotations: [
          { startIndex: 9, endIndex: 17, word: 'autobús', definition: 'bus', partOfSpeech: 'noun' },
          { startIndex: 41, endIndex: 46, word: 'llena', definition: 'full', partOfSpeech: 'adjective' },
          { startIndex: 50, endIndex: 55, word: 'gente', definition: 'people', partOfSpeech: 'noun' },
          { startIndex: 61, endIndex: 68, word: 'tiendas', definition: 'shops / stores', partOfSpeech: 'noun' },
          { startIndex: 91, endIndex: 98, word: 'mercado', definition: 'market', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 5,
        text: 'Ana entra en un restaurante. — Buenas tardes, ¿qué desea? — Quiero una ensalada y un agua, por favor. — Muy bien. ¿Algo más? — No, gracias.',
        translation: 'Ana enters a restaurant. "Good afternoon, what would you like?" "I want a salad and a water, please." "Very good. Anything else?" "No, thank you."',
        annotations: [
          { startIndex: 4, endIndex: 9, word: 'entra', definition: 'enters', partOfSpeech: 'verb' },
          { startIndex: 31, endIndex: 43, word: 'Buenas tardes', definition: 'Good afternoon', partOfSpeech: 'greeting' },
          { startIndex: 64, endIndex: 72, word: 'ensalada', definition: 'salad', partOfSpeech: 'noun' },
          { startIndex: 79, endIndex: 83, word: 'agua', definition: 'water', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'eat-stay', text: 'Ana come en el restaurante.', translation: 'Ana eats at the restaurant.', nextSegmentOrder: 6 },
          { id: 'eat-go', text: 'Ana pide la comida para llevar.', translation: 'Ana orders takeout.', nextSegmentOrder: 7 },
        ],
      },
      {
        order: 6,
        text: 'Ana come la ensalada. Está muy rica. Después paga la cuenta y sale del restaurante. — ¡Qué día tan bonito! — dice Ana con una sonrisa.',
        translation: 'Ana eats the salad. It\'s very tasty. Then she pays the check and leaves the restaurant. "What a beautiful day!" says Ana with a smile.',
        annotations: [
          { startIndex: 28, endIndex: 32, word: 'rica', definition: 'tasty / delicious', partOfSpeech: 'adjective' },
          { startIndex: 42, endIndex: 46, word: 'paga', definition: 'pays', partOfSpeech: 'verb' },
          { startIndex: 50, endIndex: 56, word: 'cuenta', definition: 'check / bill', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 7,
        text: 'Ana lleva la comida al parque. Se sienta bajo un árbol y come. El sol brilla y hace buen tiempo. Es un sábado perfecto.',
        translation: 'Ana takes the food to the park. She sits under a tree and eats. The sun shines and the weather is nice. It\'s a perfect Saturday.',
        annotations: [
          { startIndex: 4, endIndex: 9, word: 'lleva', definition: 'takes / carries', partOfSpeech: 'verb' },
          { startIndex: 49, endIndex: 54, word: 'árbol', definition: 'tree', partOfSpeech: 'noun' },
          { startIndex: 63, endIndex: 66, word: 'sol', definition: 'sun', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 73, word: 'brilla', definition: 'shines', partOfSpeech: 'verb' },
        ],
      },
    ],
  },

  // ── Story 2: La Fiesta de Cumpleaños ──
  {
    language: 'es',
    cefrLevel: 'A1',
    title: 'La Fiesta de Cumpleaños',
    description: 'Help prepare a birthday party. Practice family vocabulary, numbers, colors, and the verb tener.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 6,
    vocabularyTargets: ['family', 'numbers', 'colors', 'food'],
    grammarTargets: ['tener-present', 'adjective-agreement', 'ir-a-infinitive'],
    segments: [
      {
        order: 0,
        text: 'Hoy es un día especial. Mi hermana María tiene veinte años. Vamos a hacer una fiesta de cumpleaños.',
        translation: "Today is a special day. My sister María is twenty years old. We're going to have a birthday party.",
        annotations: [
          { startIndex: 27, endIndex: 34, word: 'hermana', definition: 'sister', partOfSpeech: 'noun' },
          { startIndex: 42, endIndex: 47, word: 'tiene', definition: 'has / is (age)', partOfSpeech: 'verb' },
          { startIndex: 48, endIndex: 54, word: 'veinte', definition: 'twenty', partOfSpeech: 'number' },
          { startIndex: 72, endIndex: 78, word: 'fiesta', definition: 'party', partOfSpeech: 'noun' },
          { startIndex: 82, endIndex: 92, word: 'cumpleaños', definition: 'birthday', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: 'Mi madre prepara una torta de chocolate. Es grande y tiene tres capas. Mi padre compra globos rojos y azules.',
        translation: 'My mother is making a chocolate cake. It\'s big and has three layers. My father buys red and blue balloons.',
        annotations: [
          { startIndex: 3, endIndex: 8, word: 'madre', definition: 'mother', partOfSpeech: 'noun' },
          { startIndex: 20, endIndex: 25, word: 'torta', definition: 'cake', partOfSpeech: 'noun' },
          { startIndex: 29, endIndex: 38, word: 'chocolate', definition: 'chocolate', partOfSpeech: 'noun' },
          { startIndex: 69, endIndex: 74, word: 'padre', definition: 'father', partOfSpeech: 'noun' },
          { startIndex: 82, endIndex: 88, word: 'globos', definition: 'balloons', partOfSpeech: 'noun' },
          { startIndex: 89, endIndex: 94, word: 'rojos', definition: 'red (plural)', partOfSpeech: 'adjective' },
          { startIndex: 97, endIndex: 103, word: 'azules', definition: 'blue (plural)', partOfSpeech: 'adjective' },
        ],
      },
      {
        order: 2,
        text: 'Los invitados llegan a las seis. Mi abuela trae una ensalada. Mi tío Carlos trae música. Hay quince personas en la casa.',
        translation: 'The guests arrive at six. My grandmother brings a salad. My uncle Carlos brings music. There are fifteen people in the house.',
        annotations: [
          { startIndex: 4, endIndex: 13, word: 'invitados', definition: 'guests', partOfSpeech: 'noun' },
          { startIndex: 36, endIndex: 42, word: 'abuela', definition: 'grandmother', partOfSpeech: 'noun' },
          { startIndex: 64, endIndex: 67, word: 'tío', definition: 'uncle', partOfSpeech: 'noun' },
          { startIndex: 91, endIndex: 97, word: 'quince', definition: 'fifteen', partOfSpeech: 'number' },
        ],
        choices: [
          { id: 'sing', text: 'Todos cantan "Feliz cumpleaños".', translation: 'Everyone sings "Happy birthday".', nextSegmentOrder: 3 },
          { id: 'gift', text: 'María abre los regalos primero.', translation: 'María opens the gifts first.', nextSegmentOrder: 4 },
        ],
      },
      {
        order: 3,
        text: '— ¡Feliz cumpleaños, María! — cantan todos. María sopla las veinte velas. — ¡Pide un deseo! — dice mi abuela. María cierra los ojos y sonríe.',
        translation: '"Happy birthday, María!" everyone sings. María blows out the twenty candles. "Make a wish!" says my grandmother. María closes her eyes and smiles.',
        annotations: [
          { startIndex: 56, endIndex: 61, word: 'sopla', definition: 'blows', partOfSpeech: 'verb' },
          { startIndex: 73, endIndex: 78, word: 'velas', definition: 'candles', partOfSpeech: 'noun' },
          { startIndex: 89, endIndex: 94, word: 'deseo', definition: 'wish', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 4,
        text: '— ¡Abre los regalos! — dice mi hermano. María abre una caja grande. Dentro hay un vestido verde muy bonito. — ¡Me encanta! ¡Gracias! — dice María.',
        translation: '"Open the gifts!" says my brother. María opens a big box. Inside there\'s a very pretty green dress. "I love it! Thank you!" says María.',
        annotations: [
          { startIndex: 7, endIndex: 14, word: 'regalos', definition: 'gifts / presents', partOfSpeech: 'noun' },
          { startIndex: 55, endIndex: 59, word: 'caja', definition: 'box', partOfSpeech: 'noun' },
          { startIndex: 78, endIndex: 85, word: 'vestido', definition: 'dress', partOfSpeech: 'noun' },
          { startIndex: 86, endIndex: 91, word: 'verde', definition: 'green', partOfSpeech: 'adjective' },
        ],
      },
      {
        order: 5,
        text: 'La fiesta es muy divertida. Todos bailan y comen torta. A las diez de la noche, los invitados se van. — Buenas noches, ¡gracias por venir! Es el mejor cumpleaños.',
        translation: "The party is very fun. Everyone dances and eats cake. At ten at night, the guests leave. \"Good night, thanks for coming! It's the best birthday.\"",
        annotations: [
          { startIndex: 17, endIndex: 26, word: 'divertida', definition: 'fun', partOfSpeech: 'adjective' },
          { startIndex: 34, endIndex: 40, word: 'bailan', definition: 'dance (they)', partOfSpeech: 'verb' },
          { startIndex: 105, endIndex: 117, word: 'Buenas noches', definition: 'Good night', partOfSpeech: 'greeting' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Describe your last birthday party in 2-3 sentences in Spanish. Use "tener", family words, and colors.',
          minWords: 5,
        },
      },
    ],
  },

  // ── Story 3: En el Supermercado ──
  {
    language: 'es',
    cefrLevel: 'A1',
    title: 'En el Supermercado',
    description: 'Go grocery shopping and learn to talk about food, quantities, and prices.',
    genre: 'practical',
    isTemplate: true,
    estimatedMinutes: 5,
    vocabularyTargets: ['food', 'numbers', 'shopping'],
    grammarTargets: ['indefinite-articles', 'tener-present', 'question-words'],
    segments: [
      {
        order: 0,
        text: 'Necesito ir al supermercado. No tengo comida en casa. Voy a hacer una lista: leche, pan, huevos, fruta y pollo.',
        translation: "I need to go to the supermarket. I don't have food at home. I'm going to make a list: milk, bread, eggs, fruit, and chicken.",
        annotations: [
          { startIndex: 15, endIndex: 27, word: 'supermercado', definition: 'supermarket', partOfSpeech: 'noun' },
          { startIndex: 38, endIndex: 44, word: 'comida', definition: 'food', partOfSpeech: 'noun' },
          { startIndex: 74, endIndex: 79, word: 'leche', definition: 'milk', partOfSpeech: 'noun' },
          { startIndex: 81, endIndex: 84, word: 'pan', definition: 'bread', partOfSpeech: 'noun' },
          { startIndex: 86, endIndex: 92, word: 'huevos', definition: 'eggs', partOfSpeech: 'noun' },
          { startIndex: 94, endIndex: 99, word: 'fruta', definition: 'fruit', partOfSpeech: 'noun' },
          { startIndex: 102, endIndex: 107, word: 'pollo', definition: 'chicken', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: 'Llego al supermercado. Es muy grande. Primero voy a la sección de frutas. Hay manzanas, naranjas, plátanos y fresas.',
        translation: 'I arrive at the supermarket. It\'s very big. First I go to the fruit section. There are apples, oranges, bananas, and strawberries.',
        annotations: [
          { startIndex: 0, endIndex: 5, word: 'Llego', definition: 'I arrive', partOfSpeech: 'verb' },
          { startIndex: 55, endIndex: 61, word: 'frutas', definition: 'fruits', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 75, word: 'manzanas', definition: 'apples', partOfSpeech: 'noun' },
          { startIndex: 77, endIndex: 85, word: 'naranjas', definition: 'oranges', partOfSpeech: 'noun' },
          { startIndex: 87, endIndex: 95, word: 'plátanos', definition: 'bananas', partOfSpeech: 'noun' },
          { startIndex: 98, endIndex: 104, word: 'fresas', definition: 'strawberries', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'apples', text: 'Compro manzanas y naranjas.', translation: 'I buy apples and oranges.', nextSegmentOrder: 2 },
          { id: 'bananas', text: 'Compro plátanos y fresas.', translation: 'I buy bananas and strawberries.', nextSegmentOrder: 2 },
        ],
      },
      {
        order: 2,
        text: '— Perdone, ¿cuánto cuesta el pollo? — pregunto al empleado. — Cuesta cinco euros el kilo. — Quiero un kilo, por favor. — Aquí tiene.',
        translation: '"Excuse me, how much does the chicken cost?" I ask the employee. "It costs five euros per kilo." "I\'d like one kilo, please." "Here you go."',
        annotations: [
          { startIndex: 2, endIndex: 9, word: 'Perdone', definition: 'Excuse me (formal)', partOfSpeech: 'verb' },
          { startIndex: 12, endIndex: 18, word: 'cuánto', definition: 'how much', partOfSpeech: 'interrogative' },
          { startIndex: 19, endIndex: 25, word: 'cuesta', definition: 'it costs', partOfSpeech: 'verb' },
          { startIndex: 53, endIndex: 58, word: 'cinco', definition: 'five', partOfSpeech: 'number' },
          { startIndex: 59, endIndex: 64, word: 'euros', definition: 'euros', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 3,
        text: 'Pago en la caja. La cuenta total es doce euros con cincuenta céntimos. Pago con tarjeta. — Gracias, hasta luego. — Adiós, buen día.',
        translation: 'I pay at the register. The total is twelve euros and fifty cents. I pay by card. "Thank you, see you later." "Goodbye, have a good day."',
        annotations: [
          { startIndex: 0, endIndex: 4, word: 'Pago', definition: 'I pay', partOfSpeech: 'verb' },
          { startIndex: 11, endIndex: 15, word: 'caja', definition: 'register / checkout', partOfSpeech: 'noun' },
          { startIndex: 36, endIndex: 40, word: 'doce', definition: 'twelve', partOfSpeech: 'number' },
          { startIndex: 52, endIndex: 60, word: 'cincuenta', definition: 'fifty', partOfSpeech: 'number' },
          { startIndex: 82, endIndex: 89, word: 'tarjeta', definition: 'card', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Write your own shopping list in Spanish with at least 5 items.',
          minWords: 5,
        },
      },
    ],
  },
];
