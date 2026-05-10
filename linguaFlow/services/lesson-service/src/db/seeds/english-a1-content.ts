/**
 * English A1 Lesson Content Seed Data
 * 4 units, 20 lessons with exercises, plus placement test questions
 * English as a foreign language for non-native speakers
 */

export const ENGLISH_A1_UNITS = [
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'Hello — Greetings & Introductions',
    description: 'Learn to greet people, introduce yourself, and use basic courtesy expressions in English.',
    order: 0,
    lessons: [
      {
        title: 'Nice to Meet You',
        description: 'Basic greetings and farewells',
        type: 'vocabulary',
        estimatedMinutes: 5,
        xpReward: 20,
        order: 0,
        exercises: [
          { type: 'multiple_choice', promptText: 'Which is a greeting?', correctAnswer: 'Hello', distractors: ['Goodbye', 'Please', 'Thank you'], hints: [], order: 0 },
          { type: 'matching', promptText: 'Match the greetings to when you use them', correctAnswer: JSON.stringify(['Good morning — before noon', 'Good afternoon — 12pm to 6pm', 'Good evening — after 6pm']), distractors: [], hints: ['Think about the time of day'], order: 1 },
          { type: 'multiple_choice', promptText: 'How do you say farewell?', correctAnswer: 'Goodbye', distractors: ['Hello', 'Thanks', 'Please'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: 'See you ___! (a casual way to say goodbye)', correctAnswer: 'later', distractors: [], hints: ['"See you later" is informal'], order: 3 },
        ],
      },
      {
        title: "What's Your Name?",
        description: 'Introducing yourself and asking names',
        type: 'vocabulary',
        estimatedMinutes: 5,
        xpReward: 20,
        order: 1,
        exercises: [
          { type: 'fill_blank', promptText: 'My ___ is Sarah. (telling someone your name)', correctAnswer: 'name', distractors: [], hints: ['"My name is…" is the standard introduction'], order: 0 },
          { type: 'reorder', promptText: 'Put in order: your / is / what / name / ?', correctAnswer: 'What is your name?', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: 'Someone says "Nice to meet you." You reply:', correctAnswer: 'Nice to meet you too.', distractors: ['I am fine.', 'My name is John.', 'Goodbye.'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: 'I ___ a student. (the verb "to be")', correctAnswer: 'am', distractors: [], hints: ['I + am'], order: 3 },
        ],
      },
      {
        title: 'Where Are You From?',
        description: 'Countries, nationalities, and the verb to be',
        type: 'grammar',
        estimatedMinutes: 8,
        xpReward: 25,
        order: 2,
        exercises: [
          { type: 'multiple_choice', promptText: '"I am from Japan" tells us about:', correctAnswer: 'Where you come from', distractors: ['Where you live now', 'What you like', 'Where you are going'], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'She ___ Brazilian. (to be)', correctAnswer: 'is', distractors: [], hints: ['Third person singular: is'], order: 1 },
          { type: 'multiple_choice', promptText: 'Which is correct? "They ___ from China."', correctAnswer: 'are', distractors: ['is', 'am', 'be'], hints: ['They + are'], order: 2 },
          { type: 'translation', promptText: 'Complete: "We ___ American."', correctAnswer: 'are', distractors: [], hints: ['We + are'], order: 3 },
        ],
      },
      {
        title: 'Numbers 1-20',
        description: 'Learn to count from one to twenty',
        type: 'vocabulary',
        estimatedMinutes: 5,
        xpReward: 20,
        order: 3,
        exercises: [
          { type: 'matching', promptText: 'Match the numbers to their words', correctAnswer: JSON.stringify(['one — 1', 'five — 5', 'ten — 10', 'fifteen — 15', 'twenty — 20']), distractors: [], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'Write the number word: 7 = ___', correctAnswer: 'seven', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: 'What number is "thirteen"?', correctAnswer: '13', distractors: ['3', '30', '14'], hints: ['Thir-teen'], order: 2 },
          { type: 'fill_blank', promptText: 'Eleven, twelve, ___, fourteen', correctAnswer: 'thirteen', distractors: [], hints: ['Counting from 11 to 14'], order: 3 },
        ],
      },
      {
        title: 'How Are You?',
        description: 'Asking about wellbeing and polite expressions',
        type: 'vocabulary',
        estimatedMinutes: 5,
        xpReward: 20,
        order: 4,
        exercises: [
          { type: 'multiple_choice', promptText: '"How are you?" — Choose the best reply:', correctAnswer: "I'm fine, thank you.", distractors: ['I am John.', 'I have fine.', 'I do fine.'], hints: [], order: 0 },
          { type: 'reorder', promptText: 'Put in order: you / thank / , / please', correctAnswer: 'Thank you, please', distractors: [], hints: [], order: 1 },
          { type: 'fill_blank', promptText: "I'm ___, thanks. (not good, not bad)", correctAnswer: 'okay', distractors: [], hints: ['"Okay" or "so-so"'], order: 2 },
          { type: 'multiple_choice', promptText: '"Excuse me" is used to:', correctAnswer: 'Get someone\'s attention politely', distractors: ['Say goodbye', 'Say thank you', 'Introduce yourself'], hints: [], order: 3 },
        ],
      },
    ],
  },
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'My Family — Family & Descriptions',
    description: 'Talk about your family, describe people, and learn colors.',
    order: 1,
    lessons: [
      {
        title: 'Family Members',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 0,
        description: 'Learn words for family relationships',
        exercises: [
          { type: 'matching', promptText: 'Match the family words', correctAnswer: JSON.stringify(['mother — mom/mum', 'father — dad', 'brother — male sibling', 'sister — female sibling']), distractors: [], hints: [], order: 0 },
          { type: 'multiple_choice', promptText: 'Your mother\'s mother is your:', correctAnswer: 'grandmother', distractors: ['aunt', 'sister', 'cousin'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'My ___ is my father\'s brother.', correctAnswer: 'uncle', distractors: [], hints: [], order: 2 },
          { type: 'multiple_choice', promptText: '"Siblings" means:', correctAnswer: 'brothers and sisters', distractors: ['parents', 'children', 'cousins'], hints: [], order: 3 },
        ],
      },
      {
        title: 'Describing People',
        type: 'grammar', estimatedMinutes: 8, xpReward: 25, order: 1,
        description: 'Adjectives to describe appearance and personality',
        exercises: [
          { type: 'multiple_choice', promptText: 'Choose the opposite of "tall":', correctAnswer: 'short', distractors: ['big', 'old', 'thin'], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'She ___ very friendly. (to be)', correctAnswer: 'is', distractors: [], hints: ['She + is'], order: 1 },
          { type: 'multiple_choice', promptText: 'Where does the adjective go in English?', correctAnswer: 'Before the noun', distractors: ['After the noun', 'At the end', 'It changes'], hints: ['Example: a tall man'], order: 2 },
          { type: 'fill_blank', promptText: 'He is a ___ man. (opposite of old)', correctAnswer: 'young', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'Colors',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 2,
        description: 'Learn the colors in English',
        exercises: [
          { type: 'matching', promptText: 'Match the colors', correctAnswer: JSON.stringify(['red — the color of fire', 'blue — the color of the sky', 'green — the color of grass', 'yellow — the color of the sun']), distractors: [], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'The opposite of black is ___.', correctAnswer: 'white', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: 'What color is an orange?', correctAnswer: 'orange', distractors: ['red', 'yellow', 'brown'], hints: ['The fruit and the color share a name'], order: 2 },
          { type: 'fill_blank', promptText: 'The sky is ___ today.', correctAnswer: 'blue', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'To Have',
        type: 'grammar', estimatedMinutes: 8, xpReward: 25, order: 3,
        description: 'The verb "to have" for possession',
        exercises: [
          { type: 'fill_blank', promptText: 'I ___ two brothers.', correctAnswer: 'have', distractors: [], hints: ['I/you/we/they → have'], order: 0 },
          { type: 'multiple_choice', promptText: 'Which is correct? "She ___ a cat."', correctAnswer: 'has', distractors: ['have', 'haves', 'having'], hints: ['He/she/it → has'], order: 1 },
          { type: 'fill_blank', promptText: 'They ___ a big house.', correctAnswer: 'have', distractors: [], hints: [], order: 2 },
          { type: 'multiple_choice', promptText: '"Do you have any pets?" — "Yes, I ___."', correctAnswer: 'do', distractors: ['have', 'am', 'has'], hints: ['Short answer: Yes, I do.'], order: 3 },
        ],
      },
      {
        title: 'My Home',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 4,
        description: 'Rooms and parts of the house',
        exercises: [
          { type: 'matching', promptText: 'Match the rooms', correctAnswer: JSON.stringify(['kitchen — where you cook', 'bathroom — where you shower', 'bedroom — where you sleep', 'living room — where you relax']), distractors: [], hints: [], order: 0 },
          { type: 'multiple_choice', promptText: '"Apartment" and "flat" both mean:', correctAnswer: 'a home in a building with other homes', distractors: ['a house', 'a room', 'a garden'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'There ___ three bedrooms in my house.', correctAnswer: 'are', distractors: [], hints: ['Plural: there are'], order: 2 },
          { type: 'fill_blank', promptText: 'The ___ is very big. (where you cook)', correctAnswer: 'kitchen', distractors: [], hints: [], order: 3 },
        ],
      },
    ],
  },
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'Daily Life — Routines & Time',
    description: 'Daily routines, telling time, and present tense verbs.',
    order: 2,
    lessons: [
      {
        title: 'Daily Routine',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 0,
        description: 'Actions you do every day',
        exercises: [
          { type: 'matching', promptText: 'Match daily activities', correctAnswer: JSON.stringify(['wake up — open your eyes in the morning', 'have breakfast — eat the first meal', 'go to work — travel to your job']), distractors: [], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'I ___ up at seven o\'clock. (to wake)', correctAnswer: 'wake', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: '"To have a shower" means:', correctAnswer: 'to wash your body with water', distractors: ['to eat', 'to sleep', 'to study'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: 'I ___ dinner at eight. (to eat)', correctAnswer: 'eat', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'Telling Time',
        type: 'grammar', estimatedMinutes: 8, xpReward: 25, order: 1,
        description: 'Ask and tell the time',
        exercises: [
          { type: 'multiple_choice', promptText: '"It\'s half past three" means:', correctAnswer: '3:30', distractors: ['3:15', '3:45', '3:00'], hints: ['Half = 30 minutes'], order: 0 },
          { type: 'fill_blank', promptText: 'What ___ is it? (asking the time)', correctAnswer: 'time', distractors: [], hints: ['"What time is it?"'], order: 1 },
          { type: 'multiple_choice', promptText: '"Quarter past one" is:', correctAnswer: '1:15', distractors: ['1:45', '1:30', '1:00'], hints: ['Quarter = 15 minutes'], order: 2 },
          { type: 'multiple_choice', promptText: '"Quarter to five" means:', correctAnswer: '4:45', distractors: ['5:15', '5:45', '5:00'], hints: ['"To" means before the hour'], order: 3 },
        ],
      },
      {
        title: 'Days & Months',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 2,
        description: 'Days of the week and months of the year',
        exercises: [
          { type: 'matching', promptText: 'Match the days', correctAnswer: JSON.stringify(['Monday — 1st day of the work week', 'Wednesday — middle of the work week', 'Friday — last work day', 'Sunday — last day of the week']), distractors: [], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'The first month of the year is ___.', correctAnswer: 'January', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: 'Which month comes after July?', correctAnswer: 'August', distractors: ['June', 'March', 'October'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: 'Today is ___. (the day between Monday and Wednesday)', correctAnswer: 'Tuesday', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'Simple Present Tense',
        type: 'grammar', estimatedMinutes: 10, xpReward: 30, order: 3,
        description: 'Use the simple present for habits and routines',
        exercises: [
          { type: 'fill_blank', promptText: 'I ___ English every day. (to study)', correctAnswer: 'study', distractors: [], hints: ['I/you/we/they + base verb'], order: 0 },
          { type: 'multiple_choice', promptText: '"She works in an office" — why "works" not "work"?', correctAnswer: 'He/she/it adds -s', distractors: ['It is past tense', 'It is plural', 'It is a question'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'He ___ coffee every morning. (to drink)', correctAnswer: 'drinks', distractors: [], hints: ['He/she/it + verb + s'], order: 2 },
          { type: 'multiple_choice', promptText: 'Which is correct?', correctAnswer: 'They live in London.', distractors: ['They lives in London.', 'They living in London.', 'They is live in London.'], hints: [], order: 3 },
          { type: 'fill_blank', promptText: 'We ___ to school by bus. (to go)', correctAnswer: 'go', distractors: [], hints: [], order: 4 },
        ],
      },
      {
        title: 'Present Continuous',
        type: 'grammar', estimatedMinutes: 10, xpReward: 30, order: 4,
        description: 'Use the present continuous for actions happening now',
        exercises: [
          { type: 'fill_blank', promptText: 'I ___ reading a book right now. (to be)', correctAnswer: 'am', distractors: [], hints: ['I + am + verb-ing'], order: 0 },
          { type: 'multiple_choice', promptText: '"She is eating lunch" describes:', correctAnswer: 'An action happening now', distractors: ['A daily habit', 'A past action', 'A future plan'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'They are ___ football. (to play)', correctAnswer: 'playing', distractors: [], hints: ['play + ing'], order: 2 },
          { type: 'multiple_choice', promptText: 'Which is correct?', correctAnswer: 'He is watching TV.', distractors: ['He watching TV.', 'He are watching TV.', 'He is watch TV.'], hints: ['Subject + is/am/are + verb-ing'], order: 3 },
          { type: 'fill_blank', promptText: 'Look! It ___ raining. (to be)', correctAnswer: 'is', distractors: [], hints: ['It + is'], order: 4 },
        ],
      },
    ],
  },
  {
    language: 'en',
    cefrLevel: 'A1',
    title: 'Around Town — Places & Directions',
    description: 'Navigate your town, order food, and go shopping.',
    order: 3,
    lessons: [
      {
        title: 'Places in Town',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 0,
        description: 'Common locations and buildings',
        exercises: [
          { type: 'matching', promptText: 'Match the places', correctAnswer: JSON.stringify(['hospital — where sick people go', 'supermarket — where you buy food', 'school — where children learn', 'park — where you walk and relax']), distractors: [], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'I go to the ___ to buy medicine. (a place for medicine)', correctAnswer: 'pharmacy', distractors: [], hints: [], order: 1 },
          { type: 'multiple_choice', promptText: 'Where do you go to catch a train?', correctAnswer: 'The station', distractors: ['The airport', 'The bank', 'The library'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: 'I need to go to the ___ to get money. (where you keep money)', correctAnswer: 'bank', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'Ordering Food',
        type: 'cultural', estimatedMinutes: 8, xpReward: 25, order: 1,
        description: 'Restaurant and café vocabulary',
        exercises: [
          { type: 'multiple_choice', promptText: 'A waiter asks "What would you like?" You want tea. You say:', correctAnswer: "I'd like a cup of tea, please.", distractors: ['Give me tea.', 'Tea is good.', 'I want have tea.'], hints: [], order: 0 },
          { type: 'fill_blank', promptText: 'Can I have the ___, please? (to pay at the end of a meal)', correctAnswer: 'bill', distractors: [], hints: ['"The bill" or "the check"'], order: 1 },
          { type: 'multiple_choice', promptText: '"Tap water" is:', correctAnswer: 'Free water from the tap', distractors: ['Bottled water', 'Sparkling water', 'Hot water'], hints: [], order: 2 },
          { type: 'fill_blank', promptText: "I'd ___ a coffee, please. (polite way to order)", correctAnswer: 'like', distractors: [], hints: ['"I\'d like" = "I would like"'], order: 3 },
        ],
      },
      {
        title: 'Directions',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 2,
        description: 'Giving and understanding directions',
        exercises: [
          { type: 'matching', promptText: 'Match direction words', correctAnswer: JSON.stringify(['left — ←', 'right — →', 'straight on — ↑', 'opposite — across from']), distractors: [], hints: [], order: 0 },
          { type: 'multiple_choice', promptText: '"Turn left at the corner" means:', correctAnswer: 'Go left when you reach the corner', distractors: ['Go right at the corner', 'Stop at the corner', 'Go straight at the corner'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'The bank is ___ to the supermarket. (beside)', correctAnswer: 'next', distractors: [], hints: ['"Next to" means beside'], order: 2 },
          { type: 'fill_blank', promptText: 'Go ___ on for 100 meters. (continuing forward)', correctAnswer: 'straight', distractors: [], hints: [], order: 3 },
        ],
      },
      {
        title: 'Going To — Future Plans',
        type: 'grammar', estimatedMinutes: 8, xpReward: 25, order: 3,
        description: 'Express future plans with "going to"',
        exercises: [
          { type: 'fill_blank', promptText: 'I ___ going to study tonight. (to be)', correctAnswer: 'am', distractors: [], hints: ['I + am + going to'], order: 0 },
          { type: 'multiple_choice', promptText: '"She is going to eat" means:', correctAnswer: 'She will eat (in the near future)', distractors: ['She is eating now', 'She ate already', 'She wants to eat'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'We are ___ to travel next week. (future plan)', correctAnswer: 'going', distractors: [], hints: [], order: 2 },
          { type: 'multiple_choice', promptText: 'Which is correct?', correctAnswer: 'They are going to visit Paris.', distractors: ['They going to visit Paris.', 'They is going to visit Paris.', 'They are go to visit Paris.'], hints: [], order: 3 },
        ],
      },
      {
        title: 'Shopping',
        type: 'vocabulary', estimatedMinutes: 5, xpReward: 20, order: 4,
        description: 'Buying things and talking about prices',
        exercises: [
          { type: 'fill_blank', promptText: 'How ___ does this cost? (asking the price)', correctAnswer: 'much', distractors: [], hints: ['"How much" for uncountable or price'], order: 0 },
          { type: 'multiple_choice', promptText: '"Cheap" means:', correctAnswer: 'not expensive', distractors: ['very expensive', 'very big', 'very small'], hints: [], order: 1 },
          { type: 'fill_blank', promptText: 'I want to pay by ___. (using a plastic card)', correctAnswer: 'card', distractors: [], hints: ['"Pay by card" vs "pay in cash"'], order: 2 },
          { type: 'multiple_choice', promptText: '"Cash" means:', correctAnswer: 'paper money and coins', distractors: ['credit card', 'receipt', 'discount'], hints: [], order: 3 },
        ],
      },
    ],
  },
];

export const ENGLISH_A1_PLACEMENT_QUESTIONS = [
  // A1 questions
  { language: 'en', cefrLevel: 'A1', type: 'multiple_choice', promptText: 'Choose the correct form: "I ___ a student."', correctAnswer: 'am', distractors: ['is', 'are', 'be'] },
  { language: 'en', cefrLevel: 'A1', type: 'multiple_choice', promptText: 'What is the plural of "child"?', correctAnswer: 'children', distractors: ['childs', 'childes', 'childern'] },
  { language: 'en', cefrLevel: 'A1', type: 'multiple_choice', promptText: 'What number is "twelve"?', correctAnswer: '12', distractors: ['2', '20', '10'] },
  { language: 'en', cefrLevel: 'A1', type: 'multiple_choice', promptText: '"She has two cats" means she ___ two cats.', correctAnswer: 'owns', distractors: ['wants', 'sees', 'likes'] },
  { language: 'en', cefrLevel: 'A1', type: 'multiple_choice', promptText: 'Complete: "They ___ in London."', correctAnswer: 'live', distractors: ['lives', 'living', 'is live'] },
  // A2 questions
  { language: 'en', cefrLevel: 'A2', type: 'multiple_choice', promptText: '"I went to the store yesterday" — what tense is "went"?', correctAnswer: 'Simple past', distractors: ['Present', 'Future', 'Present perfect'] },
  { language: 'en', cefrLevel: 'A2', type: 'multiple_choice', promptText: 'Complete: "My house is ___ than yours."', correctAnswer: 'bigger', distractors: ['more big', 'most big', 'big'] },
  { language: 'en', cefrLevel: 'A2', type: 'multiple_choice', promptText: '"I have been to Paris" uses which tense?', correctAnswer: 'Present perfect', distractors: ['Simple past', 'Present continuous', 'Past continuous'] },
  { language: 'en', cefrLevel: 'A2', type: 'multiple_choice', promptText: 'Complete: "If it rains, I ___ an umbrella."', correctAnswer: 'will take', distractors: ['take', 'took', 'taking'] },
  { language: 'en', cefrLevel: 'A2', type: 'multiple_choice', promptText: '"She enjoys swimming" — "swimming" is:', correctAnswer: 'A gerund (verb + -ing as noun)', distractors: ['A past tense', 'An adjective', 'A present continuous'] },
  // B1 questions
  { language: 'en', cefrLevel: 'B1', type: 'multiple_choice', promptText: 'Complete: "If I ___ rich, I would travel the world."', correctAnswer: 'were', distractors: ['am', 'was', 'would be'] },
  { language: 'en', cefrLevel: 'B1', type: 'multiple_choice', promptText: '"The book, which was written in 1984, is famous" — "which" introduces:', correctAnswer: 'A relative clause', distractors: ['A conditional', 'A question', 'A comparison'] },
  { language: 'en', cefrLevel: 'B1', type: 'multiple_choice', promptText: '"She said she would come" is an example of:', correctAnswer: 'Reported speech', distractors: ['Direct speech', 'A conditional', 'Passive voice'] },
  { language: 'en', cefrLevel: 'B1', type: 'multiple_choice', promptText: '"The cake was eaten by the children" is:', correctAnswer: 'Passive voice', distractors: ['Active voice', 'Reported speech', 'A conditional'] },
  { language: 'en', cefrLevel: 'B1', type: 'multiple_choice', promptText: 'Complete: "I wish I ___ speak French."', correctAnswer: 'could', distractors: ['can', 'would', 'will'] },
];
