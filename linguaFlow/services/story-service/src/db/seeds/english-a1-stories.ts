/**
 * English A1 Story Templates Seed Data
 * Interactive graded readers with vocabulary annotations and branching choices
 * English as a foreign language
 */

import type { StorySeed } from './story-seed-types';
export type { StorySegmentSeed, StorySeed } from './story-seed-types';

export const ENGLISH_A1_STORIES: StorySeed[] = [
  // ── Story 1: A Day in London ──
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'A Day in London',
    description: 'Follow Tom through his day exploring London. Practice places, directions, and ordering food.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 8,
    vocabularyTargets: ['places', 'food', 'directions', 'greetings'],
    grammarTargets: ['to-be-present', 'regular-verbs-present', 'there-is-there-are'],
    segments: [
      {
        order: 0,
        text: "Tom wakes up at eight o'clock in the morning. Today is Saturday and he doesn't have to work.",
        translation: "Tom wakes up at eight o'clock in the morning. Today is Saturday and he doesn't have to work.",
        annotations: [
          { startIndex: 4, endIndex: 12, word: 'wakes up', definition: 'stops sleeping, gets out of bed', partOfSpeech: 'verb' },
          { startIndex: 16, endIndex: 21, word: 'eight', definition: 'the number 8', partOfSpeech: 'number' },
          { startIndex: 34, endIndex: 41, word: 'morning', definition: 'the early part of the day', partOfSpeech: 'noun' },
          { startIndex: 52, endIndex: 60, word: 'Saturday', definition: 'the 6th day of the week', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: '"Good morning!" says Tom. "What do I do today? I can go to the park or visit the museum."',
        translation: '"Good morning!" says Tom. "What do I do today? I can go to the park or visit the museum."',
        annotations: [
          { startIndex: 1, endIndex: 13, word: 'Good morning', definition: 'a greeting for the morning', partOfSpeech: 'greeting' },
          { startIndex: 62, endIndex: 66, word: 'park', definition: 'a green space with trees', partOfSpeech: 'noun' },
          { startIndex: 81, endIndex: 87, word: 'museum', definition: 'a building with art or history', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'park', text: 'Tom goes to the park.', translation: 'Tom goes to the park.', nextSegmentOrder: 2 },
          { id: 'museum', text: 'Tom visits the museum.', translation: 'Tom visits the museum.', nextSegmentOrder: 4 },
        ],
      },
      // Park branch
      {
        order: 2,
        text: 'Tom walks to Hyde Park. There are many trees and flowers. The park is very beautiful. Tom sits on a bench near the lake.',
        translation: 'Tom walks to Hyde Park. There are many trees and flowers. The park is very beautiful. Tom sits on a bench near the lake.',
        annotations: [
          { startIndex: 4, endIndex: 9, word: 'walks', definition: 'moves on foot', partOfSpeech: 'verb' },
          { startIndex: 38, endIndex: 43, word: 'trees', definition: 'tall plants with leaves', partOfSpeech: 'noun' },
          { startIndex: 48, endIndex: 55, word: 'flowers', definition: 'colorful parts of plants', partOfSpeech: 'noun' },
          { startIndex: 73, endIndex: 82, word: 'beautiful', definition: 'very nice to look at', partOfSpeech: 'adjective' },
          { startIndex: 113, endIndex: 117, word: 'lake', definition: 'a large area of water', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 3,
        text: 'A man comes over. "Hi! My name is James. What\'s your name?" "I\'m Tom, nice to meet you." "Would you like a coffee? There is a café nearby."',
        translation: 'A man comes over. "Hi! My name is James. What\'s your name?" "I\'m Tom, nice to meet you." "Would you like a coffee? There is a café nearby."',
        annotations: [
          { startIndex: 19, endIndex: 21, word: 'Hi', definition: 'an informal greeting', partOfSpeech: 'greeting' },
          { startIndex: 41, endIndex: 47, word: "What's", definition: 'what is (contraction)', partOfSpeech: 'pronoun' },
          { startIndex: 107, endIndex: 113, word: 'coffee', definition: 'a hot brown drink', partOfSpeech: 'noun' },
          { startIndex: 126, endIndex: 130, word: 'café', definition: 'a small restaurant for drinks', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'How would you introduce yourself? Write 2-3 sentences in English.',
          minWords: 3,
        },
      },
      // Museum branch
      {
        order: 4,
        text: 'Tom takes the underground to the British Museum. The museum is very big. There are paintings, sculptures, and visitors from all over the world.',
        translation: 'Tom takes the underground to the British Museum. The museum is very big. There are paintings, sculptures, and visitors from all over the world.',
        annotations: [
          { startIndex: 14, endIndex: 25, word: 'underground', definition: 'the London metro/subway', partOfSpeech: 'noun' },
          { startIndex: 65, endIndex: 68, word: 'big', definition: 'large in size', partOfSpeech: 'adjective' },
          { startIndex: 80, endIndex: 89, word: 'paintings', definition: 'pictures made with paint', partOfSpeech: 'noun' },
          { startIndex: 91, endIndex: 101, word: 'sculptures', definition: 'art made from stone or metal', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 5,
        text: 'Tom goes into a restaurant. "Hello, what would you like?" "I\'d like a sandwich and a glass of water, please." "Of course. Anything else?" "No, thank you."',
        translation: 'Tom goes into a restaurant. "Hello, what would you like?" "I\'d like a sandwich and a glass of water, please." "Of course. Anything else?" "No, thank you."',
        annotations: [
          { startIndex: 15, endIndex: 25, word: 'restaurant', definition: 'a place to eat meals', partOfSpeech: 'noun' },
          { startIndex: 71, endIndex: 79, word: 'sandwich', definition: 'bread with food inside', partOfSpeech: 'noun' },
          { startIndex: 97, endIndex: 102, word: 'water', definition: 'a clear drink', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'eat-stay', text: 'Tom eats at the restaurant.', translation: 'Tom eats at the restaurant.', nextSegmentOrder: 6 },
          { id: 'eat-go', text: 'Tom gets takeaway.', translation: 'Tom gets takeaway.', nextSegmentOrder: 7 },
        ],
      },
      {
        order: 6,
        text: 'Tom eats the sandwich. It is very good. Then he pays the bill and leaves the restaurant. "What a lovely day!" says Tom with a smile.',
        translation: 'Tom eats the sandwich. It is very good. Then he pays the bill and leaves the restaurant. "What a lovely day!" says Tom with a smile.',
        annotations: [
          { startIndex: 36, endIndex: 40, word: 'good', definition: 'nice, pleasant', partOfSpeech: 'adjective' },
          { startIndex: 50, endIndex: 54, word: 'pays', definition: 'gives money for something', partOfSpeech: 'verb' },
          { startIndex: 59, endIndex: 63, word: 'bill', definition: 'the paper showing how much to pay', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 7,
        text: 'Tom takes the food to the park. He sits under a tree and eats. The sun is shining and the weather is nice. It is a perfect Saturday.',
        translation: 'Tom takes the food to the park. He sits under a tree and eats. The sun is shining and the weather is nice. It is a perfect Saturday.',
        annotations: [
          { startIndex: 47, endIndex: 51, word: 'tree', definition: 'a tall plant', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 70, word: 'sun', definition: 'the star that gives light and heat', partOfSpeech: 'noun' },
          { startIndex: 74, endIndex: 81, word: 'shining', definition: 'giving bright light', partOfSpeech: 'verb' },
          { startIndex: 90, endIndex: 97, word: 'weather', definition: 'rain, sun, wind, etc.', partOfSpeech: 'noun' },
        ],
      },
    ],
  },

  // ── Story 2: At the Coffee Shop ──
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'At the Coffee Shop',
    description: 'Order food and drinks at a coffee shop. Practice food vocabulary, numbers, and polite expressions.',
    genre: 'practical',
    isTemplate: true,
    estimatedMinutes: 5,
    vocabularyTargets: ['food', 'numbers', 'shopping', 'polite expressions'],
    grammarTargets: ['articles-the-a-an', 'to-have-present', 'question-formation'],
    segments: [
      {
        order: 0,
        text: "I am hungry. I want to go to the coffee shop. I don't have food at home. I need coffee and something to eat.",
        translation: "I am hungry. I want to go to the coffee shop. I don't have food at home. I need coffee and something to eat.",
        annotations: [
          { startIndex: 5, endIndex: 11, word: 'hungry', definition: 'wanting to eat', partOfSpeech: 'adjective' },
          { startIndex: 31, endIndex: 42, word: 'coffee shop', definition: 'a café, a place to buy coffee', partOfSpeech: 'noun' },
          { startIndex: 56, endIndex: 60, word: 'food', definition: 'things you eat', partOfSpeech: 'noun' },
          { startIndex: 75, endIndex: 81, word: 'coffee', definition: 'a hot brown drink', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: 'I arrive at the coffee shop. It is busy. There are many people. I look at the menu. There are sandwiches, cakes, and muffins.',
        translation: 'I arrive at the coffee shop. It is busy. There are many people. I look at the menu. There are sandwiches, cakes, and muffins.',
        annotations: [
          { startIndex: 2, endIndex: 8, word: 'arrive', definition: 'come to a place', partOfSpeech: 'verb' },
          { startIndex: 33, endIndex: 37, word: 'busy', definition: 'full of people', partOfSpeech: 'adjective' },
          { startIndex: 76, endIndex: 80, word: 'menu', definition: 'list of food and drinks', partOfSpeech: 'noun' },
          { startIndex: 92, endIndex: 102, word: 'sandwiches', definition: 'bread with food inside', partOfSpeech: 'noun' },
          { startIndex: 104, endIndex: 109, word: 'cakes', definition: 'sweet baked food', partOfSpeech: 'noun' },
          { startIndex: 115, endIndex: 122, word: 'muffins', definition: 'small round cakes', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'sandwich', text: "I order a sandwich and coffee.", translation: "I order a sandwich and coffee.", nextSegmentOrder: 2 },
          { id: 'cake', text: 'I order a cake and tea.', translation: 'I order a cake and tea.', nextSegmentOrder: 2 },
        ],
      },
      {
        order: 2,
        text: '"Excuse me, how much is the sandwich?" I ask. "It\'s four pounds fifty." "I\'d like one, please. And a coffee." "Here you go."',
        translation: '"Excuse me, how much is the sandwich?" I ask. "It\'s four pounds fifty." "I\'d like one, please. And a coffee." "Here you go."',
        annotations: [
          { startIndex: 1, endIndex: 10, word: 'Excuse me', definition: 'a polite way to get attention', partOfSpeech: 'phrase' },
          { startIndex: 12, endIndex: 20, word: 'how much', definition: 'asking the price', partOfSpeech: 'phrase' },
          { startIndex: 52, endIndex: 56, word: 'four', definition: 'the number 4', partOfSpeech: 'number' },
          { startIndex: 57, endIndex: 63, word: 'pounds', definition: 'British money (£)', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 3,
        text: 'I pay at the counter. The total is six pounds. I pay by card. "Thank you. Have a nice day!" "Thanks, you too. Goodbye!"',
        translation: 'I pay at the counter. The total is six pounds. I pay by card. "Thank you. Have a nice day!" "Thanks, you too. Goodbye!"',
        annotations: [
          { startIndex: 2, endIndex: 5, word: 'pay', definition: 'give money for something', partOfSpeech: 'verb' },
          { startIndex: 13, endIndex: 20, word: 'counter', definition: 'the table where you order and pay', partOfSpeech: 'noun' },
          { startIndex: 35, endIndex: 38, word: 'six', definition: 'the number 6', partOfSpeech: 'number' },
          { startIndex: 55, endIndex: 59, word: 'card', definition: 'a bank card for payment', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'What do you like to eat and drink at a coffee shop? Write 2-3 sentences.',
          minWords: 5,
        },
      },
    ],
  },

  // ── Story 3: The New Neighbor ──
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'The New Neighbor',
    description: 'Meet your new neighbor and learn about introductions, family, and descriptions.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 6,
    vocabularyTargets: ['family', 'descriptions', 'greetings', 'home'],
    grammarTargets: ['to-be-present', 'possessive-adjectives', 'going-to-future'],
    segments: [
      {
        order: 0,
        text: 'Today there is a new neighbor in our building. I can see a woman and two children. They are carrying boxes into the apartment next to mine.',
        translation: 'Today there is a new neighbor in our building. I can see a woman and two children. They are carrying boxes into the apartment next to mine.',
        annotations: [
          { startIndex: 22, endIndex: 30, word: 'neighbor', definition: 'a person who lives near you', partOfSpeech: 'noun' },
          { startIndex: 38, endIndex: 46, word: 'building', definition: 'a structure with rooms', partOfSpeech: 'noun' },
          { startIndex: 67, endIndex: 75, word: 'children', definition: 'young people (plural of child)', partOfSpeech: 'noun' },
          { startIndex: 93, endIndex: 98, word: 'boxes', definition: 'containers for carrying things', partOfSpeech: 'noun' },
          { startIndex: 108, endIndex: 117, word: 'apartment', definition: 'a flat, a home in a building', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 1,
        text: 'I make a cake to welcome them. My wife says it is a nice idea. We go to their door together.',
        translation: 'I make a cake to welcome them. My wife says it is a nice idea. We go to their door together.',
        annotations: [
          { startIndex: 9, endIndex: 13, word: 'cake', definition: 'a sweet baked food', partOfSpeech: 'noun' },
          { startIndex: 17, endIndex: 24, word: 'welcome', definition: 'to greet warmly', partOfSpeech: 'verb' },
          { startIndex: 35, endIndex: 39, word: 'wife', definition: 'a married woman', partOfSpeech: 'noun' },
          { startIndex: 81, endIndex: 89, word: 'together', definition: 'with each other', partOfSpeech: 'adverb' },
        ],
      },
      {
        order: 2,
        text: '"Hello! Welcome to the building. My name is David and this is my wife Sarah. We live next door." "Thank you! I\'m Emma. These are my children, Lily and Max."',
        translation: '"Hello! Welcome to the building. My name is David and this is my wife Sarah. We live next door." "Thank you! I\'m Emma. These are my children, Lily and Max."',
        annotations: [
          { startIndex: 1, endIndex: 6, word: 'Hello', definition: 'a greeting', partOfSpeech: 'greeting' },
          { startIndex: 8, endIndex: 15, word: 'Welcome', definition: 'a warm greeting', partOfSpeech: 'verb' },
          { startIndex: 79, endIndex: 88, word: 'next door', definition: 'in the apartment beside yours', partOfSpeech: 'phrase' },
        ],
        choices: [
          { id: 'help', text: 'David offers to help carry boxes.', translation: 'David offers to help carry boxes.', nextSegmentOrder: 3 },
          { id: 'tea', text: 'David invites Emma for tea.', translation: 'David invites Emma for tea.', nextSegmentOrder: 4 },
        ],
      },
      {
        order: 3,
        text: '"Can I help you with the boxes?" "Oh, that is very kind! Thank you." David and Emma carry the boxes together. The children play in the hallway.',
        translation: '"Can I help you with the boxes?" "Oh, that is very kind! Thank you." David and Emma carry the boxes together. The children play in the hallway.',
        annotations: [
          { startIndex: 5, endIndex: 9, word: 'help', definition: 'to assist, to make easier', partOfSpeech: 'verb' },
          { startIndex: 49, endIndex: 53, word: 'kind', definition: 'nice, generous', partOfSpeech: 'adjective' },
          { startIndex: 131, endIndex: 138, word: 'hallway', definition: 'a corridor inside a building', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 4,
        text: '"Would you like some tea?" "Yes, please! That would be lovely." They sit in the kitchen and talk. Emma is a teacher. She is from Manchester.',
        translation: '"Would you like some tea?" "Yes, please! That would be lovely." They sit in the kitchen and talk. Emma is a teacher. She is from Manchester.',
        annotations: [
          { startIndex: 20, endIndex: 23, word: 'tea', definition: 'a hot drink made with leaves', partOfSpeech: 'noun' },
          { startIndex: 55, endIndex: 61, word: 'lovely', definition: 'very nice', partOfSpeech: 'adjective' },
          { startIndex: 79, endIndex: 86, word: 'kitchen', definition: 'the room where you cook', partOfSpeech: 'noun' },
          { startIndex: 107, endIndex: 114, word: 'teacher', definition: 'a person who teaches', partOfSpeech: 'noun' },
        ],
      },
      {
        order: 5,
        text: 'It is a nice evening. Emma and the children are going to like it here. "Welcome to the neighborhood!" says David. "We are going to be great neighbors!"',
        translation: 'It is a nice evening. Emma and the children are going to like it here. "Welcome to the neighborhood!" says David. "We are going to be great neighbors!"',
        annotations: [
          { startIndex: 14, endIndex: 21, word: 'evening', definition: 'the time after afternoon', partOfSpeech: 'noun' },
          { startIndex: 86, endIndex: 98, word: 'neighborhood', definition: 'the area where you live', partOfSpeech: 'noun' },
          { startIndex: 140, endIndex: 149, word: 'neighbors', definition: 'people who live near you', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Describe your neighbors or your neighborhood in 2-3 sentences.',
          minWords: 5,
        },
      },
    ],
  },
];
