/**
 * French A1 Story Templates Seed Data
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
    nextSegmentOrder: number;
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

export const FRENCH_A1_STORIES: StorySeed[] = [
  // ── Story 1: Une Journée à Paris ──
  {
    language: 'fr',
    cefrLevel: 'A1',
    title: 'Une Journée à Paris',
    description: 'Follow Sophie through her day exploring Paris. Practice places, directions, and ordering food.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 8,
    vocabularyTargets: ['places', 'food', 'directions', 'greetings'],
    grammarTargets: ['etre-present', 'avoir-present', 'er-verbs-present'],
    segments: [
      {
        order: 0,
        text: "Sophie se réveille à huit heures du matin. Aujourd'hui c'est samedi et elle ne travaille pas.",
        translation: "Sophie wakes up at eight in the morning. Today is Saturday and she doesn't work.",
        annotations: [
          { startIndex: 7, endIndex: 18, word: 'se réveille', definition: 'wakes up', partOfSpeech: 'verb' },
          { startIndex: 21, endIndex: 25, word: 'huit', definition: 'eight', partOfSpeech: 'number' },
          { startIndex: 33, endIndex: 38, word: 'matin', definition: 'morning', partOfSpeech: 'noun' },
          { startIndex: 56, endIndex: 62, word: 'samedi', definition: 'Saturday', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: "— Bonjour ! dit Sophie. — Qu'est-ce que je fais aujourd'hui ? Je peux aller au parc ou visiter le musée.",
        translation: '"Hello!" says Sophie. "What do I do today? I can go to the park or visit the museum."',
        annotations: [
          { startIndex: 2, endIndex: 9, word: 'Bonjour', definition: 'Hello / Good morning', partOfSpeech: 'greeting' },
          { startIndex: 78, endIndex: 82, word: 'parc', definition: 'park', partOfSpeech: 'noun' },
          { startIndex: 96, endIndex: 101, word: 'musée', definition: 'museum', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'parc', text: 'Sophie va au parc.', translation: 'Sophie goes to the park.', nextSegmentOrder: 2 },
          { id: 'musee', text: 'Sophie visite le musée.', translation: 'Sophie visits the museum.', nextSegmentOrder: 4 },
        ],
      },
      // Park branch
      {
        order: 2,
        text: "Sophie marche jusqu'au Jardin du Luxembourg. Il y a beaucoup d'arbres et de fleurs. Le parc est très beau.",
        translation: 'Sophie walks to the Luxembourg Garden. There are many trees and flowers. The park is very beautiful.',
        annotations: [
          { startIndex: 7, endIndex: 13, word: 'marche', definition: 'walks', partOfSpeech: 'verb' },
          { startIndex: 62, endIndex: 68, word: 'arbres', definition: 'trees', partOfSpeech: 'noun' },
          { startIndex: 75, endIndex: 81, word: 'fleurs', definition: 'flowers', partOfSpeech: 'noun' },
          { startIndex: 101, endIndex: 105, word: 'beau', definition: 'beautiful', partOfSpeech: 'adjective' },
        ],
      },
      {
        order: 3,
        text: "Un garçon s'approche. — Salut ! Je m'appelle Lucas. Comment tu t'appelles ? — Je suis Sophie, enchantée. — Tu veux un café ? Il y a un café près d'ici.",
        translation: 'A guy comes over. "Hi! My name is Lucas. What\'s your name?" "I\'m Sophie, nice to meet you." "Want a coffee? There\'s a café nearby."',
        annotations: [
          { startIndex: 3, endIndex: 9, word: 'garçon', definition: 'boy / guy', partOfSpeech: 'noun' },
          { startIndex: 23, endIndex: 28, word: 'Salut', definition: 'Hi', partOfSpeech: 'greeting' },
          { startIndex: 80, endIndex: 89, word: 'enchantée', definition: 'nice to meet you', partOfSpeech: 'adjective' },
          { startIndex: 104, endIndex: 108, word: 'café', definition: 'coffee', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'How would you introduce yourself in French? Write a short response.',
          minWords: 3,
        },
      },
      // Museum branch
      {
        order: 4,
        text: "Sophie prend le métro jusqu'au Louvre. Le musée est immense. Il y a des tableaux, des sculptures et des visiteurs du monde entier.",
        translation: 'Sophie takes the metro to the Louvre. The museum is immense. There are paintings, sculptures, and visitors from all over the world.',
        annotations: [
          { startIndex: 15, endIndex: 20, word: 'métro', definition: 'metro / subway', partOfSpeech: 'noun' },
          { startIndex: 45, endIndex: 52, word: 'immense', definition: 'immense / huge', partOfSpeech: 'adjective' },
          { startIndex: 66, endIndex: 74, word: 'tableaux', definition: 'paintings', partOfSpeech: 'noun' },
          { startIndex: 80, endIndex: 90, word: 'sculptures', definition: 'sculptures', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 5,
        text: "Sophie entre dans un restaurant. — Bonjour, vous désirez ? — Je voudrais une salade et une eau, s'il vous plaît. — Très bien. Autre chose ? — Non, merci.",
        translation: 'Sophie enters a restaurant. "Hello, what would you like?" "I would like a salad and a water, please." "Very well. Anything else?" "No, thank you."',
        annotations: [
          { startIndex: 7, endIndex: 12, word: 'entre', definition: 'enters', partOfSpeech: 'verb' },
          { startIndex: 77, endIndex: 83, word: 'salade', definition: 'salad', partOfSpeech: 'noun' },
          { startIndex: 93, endIndex: 96, word: 'eau', definition: 'water', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'eat-stay', text: 'Sophie mange au restaurant.', translation: 'Sophie eats at the restaurant.', nextSegmentOrder: 6 },
          { id: 'eat-go', text: 'Sophie prend la nourriture à emporter.', translation: 'Sophie gets takeout.', nextSegmentOrder: 7 },
        ],
      },
      {
        order: 6,
        text: "Sophie mange la salade. C'est très bon. Après elle paie l'addition et sort du restaurant. — Quelle belle journée ! dit Sophie avec un sourire.",
        translation: 'Sophie eats the salad. It\'s very good. Then she pays the check and leaves the restaurant. "What a beautiful day!" says Sophie with a smile.',
        annotations: [
          { startIndex: 33, endIndex: 36, word: 'bon', definition: 'good / tasty', partOfSpeech: 'adjective' },
          { startIndex: 48, endIndex: 52, word: 'paie', definition: 'pays', partOfSpeech: 'verb' },
          { startIndex: 55, endIndex: 63, word: 'addition', definition: 'check / bill', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 7,
        text: "Sophie emporte la nourriture au parc. Elle s'assoit sous un arbre et mange. Le soleil brille et il fait beau. C'est un samedi parfait.",
        translation: "Sophie takes the food to the park. She sits under a tree and eats. The sun shines and it's nice out. It's a perfect Saturday.",
        annotations: [
          { startIndex: 7, endIndex: 14, word: 'emporte', definition: 'takes away / carries', partOfSpeech: 'verb' },
          { startIndex: 61, endIndex: 66, word: 'arbre', definition: 'tree', partOfSpeech: 'noun' },
          { startIndex: 79, endIndex: 85, word: 'soleil', definition: 'sun', partOfSpeech: 'noun' },
          { startIndex: 86, endIndex: 92, word: 'brille', definition: 'shines', partOfSpeech: 'verb' },
        ],
      },
    ],
  },

  // ── Story 2: Au Marché ──
  {
    language: 'fr',
    cefrLevel: 'A1',
    title: 'Au Marché',
    description: 'Go shopping at a French market and learn about food, quantities, and prices.',
    genre: 'practical',
    isTemplate: true,
    estimatedMinutes: 5,
    vocabularyTargets: ['food', 'numbers', 'shopping'],
    grammarTargets: ['partitive-articles', 'avoir-present', 'question-words'],
    segments: [
      {
        order: 0,
        text: "Je dois aller au marché. Je n'ai pas de nourriture à la maison. Je vais faire une liste : du lait, du pain, des œufs, des fruits et du poulet.",
        translation: "I need to go to the market. I don't have food at home. I'm going to make a list: milk, bread, eggs, fruit, and chicken.",
        annotations: [
          { startIndex: 19, endIndex: 25, word: 'marché', definition: 'market', partOfSpeech: 'noun' },
          { startIndex: 42, endIndex: 52, word: 'nourriture', definition: 'food', partOfSpeech: 'noun' },
          { startIndex: 90, endIndex: 94, word: 'lait', definition: 'milk', partOfSpeech: 'noun' },
          { startIndex: 99, endIndex: 103, word: 'pain', definition: 'bread', partOfSpeech: 'noun' },
          { startIndex: 109, endIndex: 113, word: 'œufs', definition: 'eggs', partOfSpeech: 'noun' },
          { startIndex: 119, endIndex: 125, word: 'fruits', definition: 'fruit', partOfSpeech: 'noun' },
          { startIndex: 132, endIndex: 138, word: 'poulet', definition: 'chicken', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: "J'arrive au marché. C'est très grand. D'abord je vais au rayon des fruits. Il y a des pommes, des oranges, des bananes et des fraises.",
        translation: "I arrive at the market. It's very big. First I go to the fruit section. There are apples, oranges, bananas, and strawberries.",
        annotations: [
          { startIndex: 2, endIndex: 8, word: 'arrive', definition: 'I arrive', partOfSpeech: 'verb' },
          { startIndex: 57, endIndex: 63, word: 'fruits', definition: 'fruits', partOfSpeech: 'noun' },
          { startIndex: 80, endIndex: 86, word: 'pommes', definition: 'apples', partOfSpeech: 'noun' },
          { startIndex: 92, endIndex: 99, word: 'oranges', definition: 'oranges', partOfSpeech: 'noun' },
          { startIndex: 105, endIndex: 112, word: 'bananes', definition: 'bananas', partOfSpeech: 'noun' },
          { startIndex: 121, endIndex: 128, word: 'fraises', definition: 'strawberries', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'pommes', text: "J'achète des pommes et des oranges.", translation: 'I buy apples and oranges.', nextSegmentOrder: 2 },
          { id: 'bananes', text: "J'achète des bananes et des fraises.", translation: 'I buy bananas and strawberries.', nextSegmentOrder: 2 },
        ],
      },
      {
        order: 2,
        text: "— Excusez-moi, combien coûte le poulet ? — C'est cinq euros le kilo. — Je voudrais un kilo, s'il vous plaît. — Voilà.",
        translation: '"Excuse me, how much does the chicken cost?" "It\'s five euros per kilo." "I\'d like one kilo, please." "Here you go."',
        annotations: [
          { startIndex: 2, endIndex: 13, word: 'Excusez-moi', definition: 'Excuse me', partOfSpeech: 'verb' },
          { startIndex: 15, endIndex: 23, word: 'combien', definition: 'how much', partOfSpeech: 'interrogative' },
          { startIndex: 24, endIndex: 29, word: 'coûte', definition: 'costs', partOfSpeech: 'verb' },
          { startIndex: 47, endIndex: 51, word: 'cinq', definition: 'five', partOfSpeech: 'number' },
          { startIndex: 52, endIndex: 57, word: 'euros', definition: 'euros', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 3,
        text: "Je paie à la caisse. Le total est douze euros cinquante. Je paie par carte. — Merci, au revoir. — Au revoir, bonne journée !",
        translation: 'I pay at the register. The total is twelve euros fifty. I pay by card. "Thank you, goodbye." "Goodbye, have a nice day!"',
        annotations: [
          { startIndex: 3, endIndex: 7, word: 'paie', definition: 'I pay', partOfSpeech: 'verb' },
          { startIndex: 14, endIndex: 20, word: 'caisse', definition: 'register / checkout', partOfSpeech: 'noun' },
          { startIndex: 35, endIndex: 40, word: 'douze', definition: 'twelve', partOfSpeech: 'number' },
          { startIndex: 47, endIndex: 57, word: 'cinquante', definition: 'fifty', partOfSpeech: 'number' },
          { startIndex: 71, endIndex: 76, word: 'carte', definition: 'card', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Write your own shopping list in French with at least 5 items.',
          minWords: 5,
        },
      },
    ],
  },

  // ── Story 3: La Fête des Voisins ──
  {
    language: 'fr',
    cefrLevel: 'A1',
    title: 'La Fête des Voisins',
    description: 'Attend a neighborhood party and meet your neighbors. Practice introductions, food vocabulary, and descriptions.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 6,
    vocabularyTargets: ['family', 'food', 'greetings', 'descriptions'],
    grammarTargets: ['etre-present', 'adjective-agreement', 'aller-a-infinitive'],
    segments: [
      {
        order: 0,
        text: "Aujourd'hui c'est la fête des voisins. C'est une fête pour rencontrer les gens de mon quartier. Je suis un peu nerveux.",
        translation: "Today is the neighborhood party. It's a party to meet the people in my neighborhood. I'm a little nervous.",
        annotations: [
          { startIndex: 24, endIndex: 28, word: 'fête', definition: 'party / celebration', partOfSpeech: 'noun' },
          { startIndex: 33, endIndex: 40, word: 'voisins', definition: 'neighbors', partOfSpeech: 'noun' },
          { startIndex: 61, endIndex: 72, word: 'rencontrer', definition: 'to meet', partOfSpeech: 'verb' },
          { startIndex: 86, endIndex: 94, word: 'quartier', definition: 'neighborhood', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: "Je prépare un gâteau au chocolat pour la fête. Ma femme apporte une salade de fruits. Nous sommes prêts !",
        translation: 'I prepare a chocolate cake for the party. My wife brings a fruit salad. We are ready!',
        annotations: [
          { startIndex: 15, endIndex: 21, word: 'gâteau', definition: 'cake', partOfSpeech: 'noun' },
          { startIndex: 25, endIndex: 33, word: 'chocolat', definition: 'chocolate', partOfSpeech: 'noun' },
          { startIndex: 52, endIndex: 57, word: 'femme', definition: 'wife', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 73, word: 'salade', definition: 'salad', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 2,
        text: "Les voisins arrivent à dix-huit heures. Il y a des familles, des couples et des personnes âgées. Tout le monde sourit.",
        translation: 'The neighbors arrive at six o\'clock. There are families, couples, and elderly people. Everyone smiles.',
        annotations: [
          { startIndex: 4, endIndex: 11, word: 'voisins', definition: 'neighbors', partOfSpeech: 'noun' },
          { startIndex: 22, endIndex: 30, word: 'dix-huit', definition: 'eighteen', partOfSpeech: 'number' },
          { startIndex: 53, endIndex: 61, word: 'familles', definition: 'families', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 74, word: 'couples', definition: 'couples', partOfSpeech: 'noun' },
          { startIndex: 111, endIndex: 117, word: 'sourit', definition: 'smiles', partOfSpeech: 'verb' },
        ],
        choices: [
          { id: 'talk', text: 'Je parle avec mes voisins.', translation: 'I talk with my neighbors.', nextSegmentOrder: 3 },
          { id: 'eat', text: 'Je mange d\'abord.', translation: 'I eat first.', nextSegmentOrder: 4 },
        ],
      },
      {
        order: 3,
        text: "— Bonsoir ! Je m'appelle Marc. J'habite au troisième étage. — Enchanté ! Moi c'est Paul. Voici ma femme Claire. — Vous avez des enfants ? — Oui, deux filles.",
        translation: '"Good evening! My name is Marc. I live on the third floor." "Nice to meet you! I\'m Paul. This is my wife Claire." "Do you have children?" "Yes, two girls."',
        annotations: [
          { startIndex: 2, endIndex: 9, word: 'Bonsoir', definition: 'Good evening', partOfSpeech: 'greeting' },
          { startIndex: 44, endIndex: 53, word: 'troisième', definition: 'third', partOfSpeech: 'adjective' },
          { startIndex: 54, endIndex: 59, word: 'étage', definition: 'floor / story', partOfSpeech: 'noun' },
          { startIndex: 124, endIndex: 131, word: 'enfants', definition: 'children', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 4,
        text: "Il y a beaucoup de nourriture. Des quiches, des fromages, du vin et des tartes. Le gâteau au chocolat est un succès !",
        translation: 'There is a lot of food. Quiches, cheeses, wine, and pies. The chocolate cake is a success!',
        annotations: [
          { startIndex: 19, endIndex: 29, word: 'nourriture', definition: 'food', partOfSpeech: 'noun' },
          { startIndex: 35, endIndex: 42, word: 'quiches', definition: 'quiches', partOfSpeech: 'noun' },
          { startIndex: 48, endIndex: 56, word: 'fromages', definition: 'cheeses', partOfSpeech: 'noun' },
          { startIndex: 62, endIndex: 65, word: 'vin', definition: 'wine', partOfSpeech: 'noun' },
          { startIndex: 74, endIndex: 80, word: 'tartes', definition: 'pies / tarts', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 5,
        text: "La fête est très agréable. Tout le monde danse et mange. À dix heures du soir, les voisins rentrent chez eux. — Bonne nuit, merci pour la fête ! C'est une belle soirée.",
        translation: 'The party is very pleasant. Everyone dances and eats. At ten at night, the neighbors go home. "Good night, thank you for the party! It\'s a lovely evening."',
        annotations: [
          { startIndex: 17, endIndex: 25, word: 'agréable', definition: 'pleasant / nice', partOfSpeech: 'adjective' },
          { startIndex: 41, endIndex: 46, word: 'danse', definition: 'dances', partOfSpeech: 'verb' },
          { startIndex: 113, endIndex: 123, word: 'Bonne nuit', definition: 'Good night', partOfSpeech: 'greeting' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Describe your neighbors or a party you attended in 2-3 sentences in French.',
          minWords: 5,
        },
      },
    ],
  },
];
