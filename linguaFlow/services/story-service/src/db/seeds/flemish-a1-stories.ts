/**
 * Flemish/Dutch A1 Story Templates Seed Data
 * Interactive graded readers with vocabulary annotations and branching choices
 */

import type { StorySeed } from './story-seed-types';
export type { StorySegmentSeed, StorySeed } from './story-seed-types';

export const FLEMISH_A1_STORIES: StorySeed[] = [
  // ── Story 1: Een Dag in Brugge ──
  {
    language: 'nl-BE',
    cefrLevel: 'A1',
    title: 'Een Dag in Brugge',
    description: 'Follow Lotte on a day trip to Bruges. Practice places, directions, and ordering food.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 8,
    vocabularyTargets: ['places', 'food', 'directions', 'greetings'],
    grammarTargets: ['zijn-present', 'hebben-present', 'regular-verbs-present', 'separable-verbs'],
    segments: [
      {
        // 'Lotte staat vroeg op. Het is zaterdag en zij hoeft niet te werken.'
        //  0123456789...
        order: 0,
        text: 'Lotte staat vroeg op. Het is zaterdag en zij hoeft niet te werken.',
        translation: 'Lotte gets up early. It is Saturday and she doesn\'t have to work.',
        annotations: [
          { startIndex: 6, endIndex: 11, word: 'staat', definition: 'stands / gets (up)', partOfSpeech: 'verb' },
          { startIndex: 12, endIndex: 17, word: 'vroeg', definition: 'early', partOfSpeech: 'adverb' },
          { startIndex: 29, endIndex: 37, word: 'zaterdag', definition: 'Saturday', partOfSpeech: 'noun' },
          { startIndex: 45, endIndex: 50, word: 'hoeft', definition: 'needs to / has to', partOfSpeech: 'verb' },
        ],
      },
      {
        // 'Goedemorgen! zegt Lotte. Wat doe ik vandaag? Ik kan naar Brugge gaan of thuis blijven.'
        //  0         1         2         3         4         5         6         7         8
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567
        order: 1,
        text: '— Goedemorgen! — zegt Lotte. — Wat doe ik vandaag? Ik kan naar Brugge gaan of thuis blijven.',
        translation: '"Good morning!" says Lotte. "What do I do today? I can go to Bruges or stay home."',
        annotations: [
          { startIndex: 2, endIndex: 13, word: 'Goedemorgen', definition: 'Good morning', partOfSpeech: 'greeting' },
          { startIndex: 42, endIndex: 49, word: 'vandaag', definition: 'today', partOfSpeech: 'adverb' },
          { startIndex: 63, endIndex: 69, word: 'Brugge', definition: 'Bruges', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'brugge', text: 'Lotte gaat naar Brugge.', translation: 'Lotte goes to Bruges.', nextSegmentOrder: 2 },
          { id: 'thuis', text: 'Lotte blijft thuis.', translation: 'Lotte stays home.', nextSegmentOrder: 5 },
        ],
      },
      // Bruges branch
      {
        // 'Lotte neemt de trein naar Brugge. De reis duurt een uur. Zij leest een boek in de trein.'
        //  0         1         2         3         4         5         6         7         8
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678
        order: 2,
        text: 'Lotte neemt de trein naar Brugge. De reis duurt een uur. Zij leest een boek in de trein.',
        translation: 'Lotte takes the train to Bruges. The trip takes an hour. She reads a book on the train.',
        annotations: [
          { startIndex: 6, endIndex: 11, word: 'neemt', definition: 'takes', partOfSpeech: 'verb' },
          { startIndex: 15, endIndex: 20, word: 'trein', definition: 'train', partOfSpeech: 'noun' },
          { startIndex: 37, endIndex: 41, word: 'reis', definition: 'trip / journey', partOfSpeech: 'noun' },
          { startIndex: 42, endIndex: 47, word: 'duurt', definition: 'takes (time) / lasts', partOfSpeech: 'verb' },
        ],
      },
      {
        // 'Brugge is heel mooi. Er zijn oude gebouwen en mooie grachten. Lotte wandelt door de stad.'
        //  0         1         2         3         4         5         6         7         8
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
        order: 3,
        text: 'Brugge is heel mooi. Er zijn oude gebouwen en mooie grachten. Lotte wandelt door de stad.',
        translation: 'Bruges is very beautiful. There are old buildings and beautiful canals. Lotte walks through the city.',
        annotations: [
          { startIndex: 15, endIndex: 19, word: 'mooi', definition: 'beautiful', partOfSpeech: 'adjective' },
          { startIndex: 21, endIndex: 28, word: 'Er zijn', definition: 'There are', partOfSpeech: 'verb' },
          { startIndex: 34, endIndex: 42, word: 'gebouwen', definition: 'buildings', partOfSpeech: 'noun' },
          { startIndex: 52, endIndex: 60, word: 'grachten', definition: 'canals', partOfSpeech: 'noun' },
          { startIndex: 68, endIndex: 75, word: 'wandelt', definition: 'walks', partOfSpeech: 'verb' },
        ],
      },
      {
        // 'Lotte gaat naar een restaurant. — Goedemiddag, wat mag het zijn? — Ik wil graag een tomatensoep en een stuk taart, alstublieft. — Uitstekend!'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12        13        14
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
        order: 4,
        text: 'Lotte gaat naar een restaurant. — Goedemiddag, wat mag het zijn? — Ik wil graag een tomatensoep en een stuk taart, alstublieft. — Uitstekend!',
        translation: 'Lotte goes to a restaurant. "Good afternoon, what would you like?" "I would like a tomato soup and a piece of cake, please." "Excellent!"',
        annotations: [
          { startIndex: 20, endIndex: 30, word: 'restaurant', definition: 'restaurant', partOfSpeech: 'noun' },
          { startIndex: 34, endIndex: 45, word: 'Goedemiddag', definition: 'Good afternoon', partOfSpeech: 'greeting' },
          { startIndex: 84, endIndex: 95, word: 'tomatensoep', definition: 'tomato soup', partOfSpeech: 'noun' },
          { startIndex: 103, endIndex: 107, word: 'stuk', definition: 'piece', partOfSpeech: 'noun' },
          { startIndex: 108, endIndex: 113, word: 'taart', definition: 'cake / tart', partOfSpeech: 'noun' },
          { startIndex: 115, endIndex: 126, word: 'alstublieft', definition: 'please', partOfSpeech: 'adverb' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'What would you order at a restaurant in Bruges? Write a short sentence in Dutch using "Ik wil graag...".',
          minWords: 3,
        },
      },
      // Home branch
      {
        // 'Lotte blijft thuis. Zij maakt het ontbijt klaar: boterhammen met kaas en een kopje koffie.'
        //  0         1         2         3         4         5         6         7         8
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901
        order: 5,
        text: 'Lotte blijft thuis. Zij maakt het ontbijt klaar: boterhammen met kaas en een kopje koffie.',
        translation: 'Lotte stays home. She makes breakfast: sandwiches with cheese and a cup of coffee.',
        annotations: [
          { startIndex: 6, endIndex: 12, word: 'blijft', definition: 'stays', partOfSpeech: 'verb' },
          { startIndex: 13, endIndex: 18, word: 'thuis', definition: 'home / at home', partOfSpeech: 'adverb' },
          { startIndex: 34, endIndex: 41, word: 'ontbijt', definition: 'breakfast', partOfSpeech: 'noun' },
          { startIndex: 49, endIndex: 60, word: 'boterhammen', definition: 'sandwiches', partOfSpeech: 'noun' },
          { startIndex: 65, endIndex: 69, word: 'kaas', definition: 'cheese', partOfSpeech: 'noun' },
          { startIndex: 77, endIndex: 82, word: 'kopje', definition: 'cup (diminutive)', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'Een vriendin belt op. — Hallo Lotte! Ga je mee naar de markt? Er is vandaag een brocantemarkt op het plein.'
        //  0         1         2         3         4         5         6         7         8         9        10
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
        order: 6,
        text: 'Een vriendin belt op. — Hallo Lotte! Ga je mee naar de markt? Er is vandaag een brocantemarkt op het plein.',
        translation: 'A friend calls. "Hello Lotte! Are you coming to the market? There is a flea market in the square today."',
        annotations: [
          { startIndex: 4, endIndex: 12, word: 'vriendin', definition: 'female friend', partOfSpeech: 'noun' },
          { startIndex: 13, endIndex: 20, word: 'belt op', definition: 'calls (separable verb)', partOfSpeech: 'verb' },
          { startIndex: 55, endIndex: 60, word: 'markt', definition: 'market', partOfSpeech: 'noun' },
          { startIndex: 80, endIndex: 93, word: 'brocantemarkt', definition: 'flea market / antique market', partOfSpeech: 'noun' },
          { startIndex: 101, endIndex: 106, word: 'plein', definition: 'square', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'Lotte gaat naar de markt. Er zijn veel mooie dingen. Zij koopt een klein schilderijtje. Het is een mooie dag!'
        //  0         1         2         3         4         5         6         7         8         9        10
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678
        order: 7,
        text: 'Lotte gaat naar de markt. Er zijn veel mooie dingen. Zij koopt een klein schilderijtje. Het is een mooie dag!',
        translation: 'Lotte goes to the market. There are many nice things. She buys a small painting. It is a beautiful day!',
        annotations: [
          { startIndex: 26, endIndex: 33, word: 'Er zijn', definition: 'There are', partOfSpeech: 'verb' },
          { startIndex: 45, endIndex: 51, word: 'dingen', definition: 'things', partOfSpeech: 'noun' },
          { startIndex: 57, endIndex: 62, word: 'koopt', definition: 'buys', partOfSpeech: 'verb' },
          { startIndex: 73, endIndex: 86, word: 'schilderijtje', definition: 'small painting (diminutive)', partOfSpeech: 'noun' },
        ],
      },
    ],
  },

  // ── Story 2: Op de Markt ──
  {
    language: 'nl-BE',
    cefrLevel: 'A1',
    title: 'Op de Markt',
    description: 'Go shopping at a Belgian market. Practice food vocabulary, numbers, and prices.',
    genre: 'practical',
    isTemplate: true,
    estimatedMinutes: 5,
    vocabularyTargets: ['food', 'numbers', 'shopping'],
    grammarTargets: ['indefinite-articles', 'er-is-er-zijn', 'question-words'],
    segments: [
      {
        // 'Het is zaterdagochtend. Ik ga naar de markt in het centrum. Ik heb een boodschappenlijst: groenten, fruit, brood en kaas.'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12
        //  012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345
        order: 0,
        text: 'Het is zaterdagochtend. Ik ga naar de markt in het centrum. Ik heb een boodschappenlijst: groenten, fruit, brood en kaas.',
        translation: 'It is Saturday morning. I go to the market in the center. I have a shopping list: vegetables, fruit, bread, and cheese.',
        annotations: [
          { startIndex: 7, endIndex: 22, word: 'zaterdagochtend', definition: 'Saturday morning', partOfSpeech: 'noun' },
          { startIndex: 38, endIndex: 43, word: 'markt', definition: 'market', partOfSpeech: 'noun' },
          { startIndex: 51, endIndex: 58, word: 'centrum', definition: 'center / downtown', partOfSpeech: 'noun' },
          { startIndex: 71, endIndex: 88, word: 'boodschappenlijst', definition: 'shopping list', partOfSpeech: 'noun' },
          { startIndex: 90, endIndex: 98, word: 'groenten', definition: 'vegetables', partOfSpeech: 'noun' },
          { startIndex: 107, endIndex: 112, word: 'brood', definition: 'bread', partOfSpeech: 'noun' },
          { startIndex: 116, endIndex: 120, word: 'kaas', definition: 'cheese', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'Ik kom aan bij de markt. Er zijn veel kraampjes. Eerst ga ik naar de groentekraam. Er zijn tomaten, wortelen, aardappelen en uien.'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012
        order: 1,
        text: 'Ik kom aan bij de markt. Er zijn veel kraampjes. Eerst ga ik naar de groentekraam. Er zijn tomaten, wortelen, aardappelen en uien.',
        translation: 'I arrive at the market. There are many stalls. First I go to the vegetable stall. There are tomatoes, carrots, potatoes, and onions.',
        annotations: [
          { startIndex: 3, endIndex: 10, word: 'kom aan', definition: 'arrive (separable verb)', partOfSpeech: 'verb' },
          { startIndex: 38, endIndex: 47, word: 'kraampjes', definition: 'small stalls (diminutive)', partOfSpeech: 'noun' },
          { startIndex: 69, endIndex: 81, word: 'groentekraam', definition: 'vegetable stall', partOfSpeech: 'noun' },
          { startIndex: 91, endIndex: 98, word: 'tomaten', definition: 'tomatoes', partOfSpeech: 'noun' },
          { startIndex: 100, endIndex: 108, word: 'wortelen', definition: 'carrots', partOfSpeech: 'noun' },
          { startIndex: 110, endIndex: 121, word: 'aardappelen', definition: 'potatoes', partOfSpeech: 'noun' },
          { startIndex: 125, endIndex: 129, word: 'uien', definition: 'onions', partOfSpeech: 'noun' },
        ],
        choices: [
          { id: 'tomaten', text: 'Ik koop tomaten en wortelen.', translation: 'I buy tomatoes and carrots.', nextSegmentOrder: 2 },
          { id: 'aardappelen', text: 'Ik koop aardappelen en uien.', translation: 'I buy potatoes and onions.', nextSegmentOrder: 2 },
        ],
      },
      {
        // '— Goedemorgen, hoeveel kosten de tomaten? — Twee euro per kilo. — Ik wil graag een kilo, alstublieft. — Alstublieft, nog iets anders?'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12        13
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678
        order: 2,
        text: '— Goedemorgen, hoeveel kosten de tomaten? — Twee euro per kilo. — Ik wil graag een kilo, alstublieft. — Alstublieft, nog iets anders?',
        translation: '"Good morning, how much do the tomatoes cost?" "Two euros per kilo." "I would like one kilo, please." "Here you go, anything else?"',
        annotations: [
          { startIndex: 15, endIndex: 22, word: 'hoeveel', definition: 'how much / how many', partOfSpeech: 'interrogative' },
          { startIndex: 23, endIndex: 29, word: 'kosten', definition: 'cost (plural)', partOfSpeech: 'verb' },
          { startIndex: 44, endIndex: 48, word: 'Twee', definition: 'two', partOfSpeech: 'number' },
          { startIndex: 49, endIndex: 53, word: 'euro', definition: 'euros', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'Dan ga ik naar de kaaskraam. Er is veel Belgische kaas. Ik koop een stuk oude kaas. Het kost drie euro vijftig.'
        //  0         1         2         3         4         5         6         7         8         9        10
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
        order: 3,
        text: 'Dan ga ik naar de kaaskraam. Er is veel Belgische kaas. Ik koop een stuk oude kaas. Het kost drie euro vijftig.',
        translation: 'Then I go to the cheese stall. There is a lot of Belgian cheese. I buy a piece of old cheese. It costs three euros fifty.',
        annotations: [
          { startIndex: 18, endIndex: 27, word: 'kaaskraam', definition: 'cheese stall', partOfSpeech: 'noun' },
          { startIndex: 40, endIndex: 49, word: 'Belgische', definition: 'Belgian', partOfSpeech: 'adjective' },
          { startIndex: 50, endIndex: 54, word: 'kaas', definition: 'cheese', partOfSpeech: 'noun' },
          { startIndex: 93, endIndex: 97, word: 'drie', definition: 'three', partOfSpeech: 'number' },
        ],
      },
      {
        // 'Ik betaal aan de kassa. Het totaal is acht euro vijftig. Ik betaal contant. — Dank u wel, tot ziens! — Tot ziens, een fijne dag!'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12
        //  012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678
        order: 4,
        text: 'Ik betaal aan de kassa. Het totaal is acht euro vijftig. Ik betaal contant. — Dank u wel, tot ziens! — Tot ziens, een fijne dag!',
        translation: 'I pay at the register. The total is eight euros fifty. I pay cash. "Thank you, goodbye!" "Goodbye, have a nice day!"',
        annotations: [
          { startIndex: 3, endIndex: 9, word: 'betaal', definition: 'pay', partOfSpeech: 'verb' },
          { startIndex: 17, endIndex: 22, word: 'kassa', definition: 'register / checkout', partOfSpeech: 'noun' },
          { startIndex: 38, endIndex: 42, word: 'acht', definition: 'eight', partOfSpeech: 'number' },
          { startIndex: 67, endIndex: 74, word: 'contant', definition: 'cash', partOfSpeech: 'noun' },
          { startIndex: 90, endIndex: 99, word: 'tot ziens', definition: 'goodbye', partOfSpeech: 'greeting' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Write your own shopping list in Dutch with at least 5 items you would buy at the market.',
          minWords: 5,
        },
      },
    ],
  },

  // ── Story 3: Het Verjaardagsfeest ──
  {
    language: 'nl-BE',
    cefrLevel: 'A1',
    title: 'Het Verjaardagsfeest',
    description: 'Help prepare a birthday party. Practice family vocabulary, numbers, and the verb hebben.',
    genre: 'slice_of_life',
    isTemplate: true,
    estimatedMinutes: 6,
    vocabularyTargets: ['family', 'numbers', 'colors', 'food'],
    grammarTargets: ['hebben-present', 'adjective-agreement', 'modal-verbs', 'diminutives'],
    segments: [
      {
        // 'Vandaag is een bijzondere dag. Mijn broer Thomas wordt twintig jaar. Wij gaan een verjaardagsfeest organiseren.'
        //  0         1         2         3         4         5         6         7         8         9        10
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012
        order: 0,
        text: 'Vandaag is een bijzondere dag. Mijn broer Thomas wordt twintig jaar. Wij gaan een verjaardagsfeest organiseren.',
        translation: 'Today is a special day. My brother Thomas turns twenty. We are going to organize a birthday party.',
        annotations: [
          { startIndex: 0, endIndex: 7, word: 'Vandaag', definition: 'today', partOfSpeech: 'adverb' },
          { startIndex: 15, endIndex: 25, word: 'bijzondere', definition: 'special', partOfSpeech: 'adjective' },
          { startIndex: 36, endIndex: 41, word: 'broer', definition: 'brother', partOfSpeech: 'noun' },
          { startIndex: 55, endIndex: 62, word: 'twintig', definition: 'twenty', partOfSpeech: 'number' },
          { startIndex: 82, endIndex: 98, word: 'verjaardagsfeest', definition: 'birthday party', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'Mijn moeder bakt een chocoladetaart. De taart is groot en heeft drie lagen. Mijn vader koopt rode en blauwe ballonnen.'
        //  0         1         2         3         4         5         6         7         8         9        10        11
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
        order: 1,
        text: 'Mijn moeder bakt een chocoladetaart. De taart is groot en heeft drie lagen. Mijn vader koopt rode en blauwe ballonnen.',
        translation: 'My mother bakes a chocolate cake. The cake is big and has three layers. My father buys red and blue balloons.',
        annotations: [
          { startIndex: 5, endIndex: 11, word: 'moeder', definition: 'mother', partOfSpeech: 'noun' },
          { startIndex: 12, endIndex: 16, word: 'bakt', definition: 'bakes', partOfSpeech: 'verb' },
          { startIndex: 21, endIndex: 35, word: 'chocoladetaart', definition: 'chocolate cake', partOfSpeech: 'noun' },
          { startIndex: 81, endIndex: 86, word: 'vader', definition: 'father', partOfSpeech: 'noun' },
          { startIndex: 93, endIndex: 97, word: 'rode', definition: 'red', partOfSpeech: 'adjective' },
          { startIndex: 101, endIndex: 107, word: 'blauwe', definition: 'blue', partOfSpeech: 'adjective' },
          { startIndex: 108, endIndex: 117, word: 'ballonnen', definition: 'balloons', partOfSpeech: 'noun' },
        ],
      },
      {
        // 'De gasten komen om zes uur. Mijn oma brengt een salade mee. Oom Pieter brengt muziek mee. Er zijn vijftien mensen in huis.'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12
        //  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123
        order: 2,
        text: 'De gasten komen om zes uur. Mijn oma brengt een salade mee. Oom Pieter brengt muziek mee. Er zijn vijftien mensen in huis.',
        translation: 'The guests arrive at six o\'clock. My grandmother brings a salad along. Uncle Pieter brings music along. There are fifteen people in the house.',
        annotations: [
          { startIndex: 3, endIndex: 9, word: 'gasten', definition: 'guests', partOfSpeech: 'noun' },
          { startIndex: 33, endIndex: 36, word: 'oma', definition: 'grandmother', partOfSpeech: 'noun' },
          { startIndex: 37, endIndex: 43, word: 'brengt', definition: 'brings', partOfSpeech: 'verb' },
          { startIndex: 60, endIndex: 63, word: 'Oom', definition: 'uncle', partOfSpeech: 'noun' },
          { startIndex: 98, endIndex: 106, word: 'vijftien', definition: 'fifteen', partOfSpeech: 'number' },
        ],
      },
      {
        // '— Lang zal hij leven! — zingt iedereen. Thomas blaast de twintig kaarsjes uit. — Doe een wens! — zegt mijn oma. Thomas sluit zijn ogen en lacht.'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12        13        14
        //  012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456
        order: 3,
        text: '— Lang zal hij leven! — zingt iedereen. Thomas blaast de twintig kaarsjes uit. — Doe een wens! — zegt mijn oma. Thomas sluit zijn ogen en lacht.',
        translation: '"Long may he live!" sings everyone. Thomas blows out the twenty candles. "Make a wish!" says my grandmother. Thomas closes his eyes and laughs.',
        annotations: [
          { startIndex: 2, endIndex: 20, word: 'Lang zal hij leven', definition: 'Long may he live (Dutch birthday song)', partOfSpeech: 'phrase' },
          { startIndex: 47, endIndex: 53, word: 'blaast', definition: 'blows', partOfSpeech: 'verb' },
          { startIndex: 65, endIndex: 73, word: 'kaarsjes', definition: 'little candles (diminutive)', partOfSpeech: 'noun' },
          { startIndex: 89, endIndex: 93, word: 'wens', definition: 'wish', partOfSpeech: 'noun' },
        ],
      },
      {
        // '— Maak je cadeau open! — zegt mijn zus. Thomas opent een grote doos. Er zit een mooie nieuwe fiets in. — Geweldig! Dank jullie wel! — zegt Thomas blij.'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12        13        14        15
        //  012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345
        order: 4,
        text: '— Maak je cadeau open! — zegt mijn zus. Thomas opent een grote doos. Er zit een mooie nieuwe fiets in. — Geweldig! Dank jullie wel! — zegt Thomas blij.',
        translation: '"Open your present!" says my sister. Thomas opens a big box. Inside there is a beautiful new bicycle. "Amazing! Thank you all!" says Thomas happily.',
        annotations: [
          { startIndex: 10, endIndex: 16, word: 'cadeau', definition: 'gift / present', partOfSpeech: 'noun' },
          { startIndex: 35, endIndex: 38, word: 'zus', definition: 'sister', partOfSpeech: 'noun' },
          { startIndex: 63, endIndex: 67, word: 'doos', definition: 'box', partOfSpeech: 'noun' },
          { startIndex: 93, endIndex: 98, word: 'fiets', definition: 'bicycle', partOfSpeech: 'noun' },
          { startIndex: 105, endIndex: 113, word: 'Geweldig', definition: 'amazing / great', partOfSpeech: 'adjective' },
        ],
      },
      {
        // 'Het feest is heel leuk. Iedereen danst en eet taart. Om tien uur gaan de gasten naar huis. — Goedenacht, bedankt voor alles! Het was de beste verjaardag!'
        //  0         1         2         3         4         5         6         7         8         9        10        11        12        13        14        15
        //  01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567
        order: 5,
        text: 'Het feest is heel leuk. Iedereen danst en eet taart. Om tien uur gaan de gasten naar huis. — Goedenacht, bedankt voor alles! Het was de beste verjaardag!',
        translation: 'The party is very fun. Everyone dances and eats cake. At ten o\'clock the guests go home. "Good night, thanks for everything! It was the best birthday!"',
        annotations: [
          { startIndex: 18, endIndex: 22, word: 'leuk', definition: 'fun / nice', partOfSpeech: 'adjective' },
          { startIndex: 33, endIndex: 38, word: 'danst', definition: 'dances', partOfSpeech: 'verb' },
          { startIndex: 93, endIndex: 103, word: 'Goedenacht', definition: 'Good night', partOfSpeech: 'greeting' },
          { startIndex: 142, endIndex: 152, word: 'verjaardag', definition: 'birthday', partOfSpeech: 'noun' },
        ],
        promptForUser: {
          type: 'free_response',
          instruction: 'Describe your last birthday party in 2-3 sentences in Dutch. Use family words, numbers, and colors.',
          minWords: 5,
        },
      },
    ],
  },
];
