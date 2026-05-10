import type { DrillMode } from '@linguaflow/shared';

interface GeneratedPrompt {
  type: string;
  content: string;
  instruction: string;
  targetVocabulary: string[];
  targetGrammar: string[];
}

const REFORMULATION_PROMPTS: Record<string, GeneratedPrompt[]> = {
  A1: [
    { type: 'text', content: 'I eat breakfast every morning.', instruction: 'Make this sentence negative.', targetVocabulary: ['breakfast', 'morning'], targetGrammar: ['negative_sentences'] },
    { type: 'text', content: 'She goes to school.', instruction: 'Change to a question.', targetVocabulary: ['school'], targetGrammar: ['question_formation'] },
    { type: 'text', content: 'They have two cats.', instruction: 'Change the subject to "he".', targetVocabulary: ['cats'], targetGrammar: ['subject_verb_agreement'] },
    { type: 'text', content: 'We live in a big city.', instruction: 'Change to past tense.', targetVocabulary: ['city'], targetGrammar: ['past_simple'] },
    { type: 'text', content: 'The book is on the table.', instruction: 'Make this a question.', targetVocabulary: ['book', 'table'], targetGrammar: ['question_formation'] },
    { type: 'text', content: 'I like coffee.', instruction: 'Change to "she".', targetVocabulary: ['coffee'], targetGrammar: ['subject_verb_agreement'] },
    { type: 'text', content: 'He plays football on Sundays.', instruction: 'Make this negative.', targetVocabulary: ['football'], targetGrammar: ['negative_sentences'] },
    { type: 'text', content: 'My mother cooks dinner.', instruction: 'Change to a question.', targetVocabulary: ['dinner'], targetGrammar: ['question_formation'] },
    { type: 'text', content: 'The children are happy.', instruction: 'Make this negative.', targetVocabulary: ['children', 'happy'], targetGrammar: ['negative_sentences'] },
    { type: 'text', content: 'I walk to work every day.', instruction: 'Change to past tense.', targetVocabulary: ['walk', 'work'], targetGrammar: ['past_simple'] },
  ],
  A2: [
    { type: 'text', content: 'I have been waiting for an hour.', instruction: 'Change to simple past.', targetVocabulary: ['waiting'], targetGrammar: ['past_simple'] },
    { type: 'text', content: 'She will travel to Paris next week.', instruction: 'Change to a conditional sentence.', targetVocabulary: ['travel', 'Paris'], targetGrammar: ['conditionals'] },
    { type: 'text', content: 'They are going to move to a new house.', instruction: 'Make this a question.', targetVocabulary: ['move', 'house'], targetGrammar: ['question_formation'] },
    { type: 'text', content: 'He can speak three languages.', instruction: 'Change to past ability.', targetVocabulary: ['languages'], targetGrammar: ['modal_verbs'] },
    { type: 'text', content: 'We must finish the project today.', instruction: 'Make this negative.', targetVocabulary: ['project'], targetGrammar: ['modal_verbs'] },
    { type: 'text', content: 'The movie was more interesting than the book.', instruction: 'Change to superlative.', targetVocabulary: ['interesting'], targetGrammar: ['comparatives_superlatives'] },
    { type: 'text', content: 'I usually eat lunch at noon.', instruction: 'Change to present continuous.', targetVocabulary: ['lunch', 'noon'], targetGrammar: ['present_continuous'] },
    { type: 'text', content: 'She has already finished her homework.', instruction: 'Make this a question.', targetVocabulary: ['homework'], targetGrammar: ['present_perfect'] },
    { type: 'text', content: 'We should study harder for the exam.', instruction: 'Change to a recommendation using "ought to".', targetVocabulary: ['study', 'exam'], targetGrammar: ['modal_verbs'] },
    { type: 'text', content: 'The store opens at nine o\'clock.', instruction: 'Change to passive voice.', targetVocabulary: ['store'], targetGrammar: ['passive_voice'] },
  ],
  B1: [
    { type: 'text', content: 'If I had more time, I would learn to play the guitar.', instruction: 'Change to third conditional.', targetVocabulary: ['guitar'], targetGrammar: ['conditionals'] },
    { type: 'text', content: 'The report was written by the manager.', instruction: 'Change to active voice.', targetVocabulary: ['report', 'manager'], targetGrammar: ['passive_voice'] },
    { type: 'text', content: 'She told me that she was feeling unwell.', instruction: 'Change to direct speech.', targetVocabulary: ['unwell'], targetGrammar: ['reported_speech'] },
    { type: 'text', content: 'By the time we arrived, the concert had already started.', instruction: 'Rewrite using "when" instead of "by the time".', targetVocabulary: ['concert'], targetGrammar: ['past_perfect'] },
    { type: 'text', content: 'He suggested that we should go to the beach.', instruction: 'Change to indirect suggestion using "how about".', targetVocabulary: ['beach'], targetGrammar: ['reported_speech'] },
    { type: 'text', content: 'I wish I could speak Japanese fluently.', instruction: 'Rewrite as a regret about the past.', targetVocabulary: ['fluently'], targetGrammar: ['wish_clauses'] },
    { type: 'text', content: 'Despite the rain, they continued the match.', instruction: 'Rewrite using "although".', targetVocabulary: ['rain', 'match'], targetGrammar: ['concession_clauses'] },
    { type: 'text', content: 'Not only did she win the race, but she also broke the record.', instruction: 'Simplify without inversion.', targetVocabulary: ['race', 'record'], targetGrammar: ['inversion'] },
    { type: 'text', content: 'The museum, which was built in 1920, attracts thousands of visitors.', instruction: 'Change to a defining relative clause.', targetVocabulary: ['museum', 'visitors'], targetGrammar: ['relative_clauses'] },
    { type: 'text', content: 'You had better apologize before it is too late.', instruction: 'Rewrite using "should".', targetVocabulary: ['apologize'], targetGrammar: ['modal_verbs'] },
  ],
  B2: [
    { type: 'text', content: 'Had I known about the traffic, I would have left earlier.', instruction: 'Rewrite without inversion.', targetVocabulary: ['traffic'], targetGrammar: ['conditionals', 'inversion'] },
    { type: 'text', content: 'It is believed that the company will merge with its competitor.', instruction: 'Change to personal passive.', targetVocabulary: ['merge', 'competitor'], targetGrammar: ['passive_voice'] },
    { type: 'text', content: 'She couldn\'t have been at the party because she was abroad.', instruction: 'Rewrite using "It is impossible that...".', targetVocabulary: ['party', 'abroad'], targetGrammar: ['modal_perfect'] },
    { type: 'text', content: 'The more you practice, the better you become.', instruction: 'Rewrite using a conditional structure.', targetVocabulary: ['practice'], targetGrammar: ['comparatives_superlatives'] },
    { type: 'text', content: 'Were it not for your help, I would have failed the exam.', instruction: 'Rewrite using "if".', targetVocabulary: ['exam'], targetGrammar: ['conditionals', 'inversion'] },
    { type: 'text', content: 'No sooner had the lecture begun than the fire alarm went off.', instruction: 'Rewrite without inversion.', targetVocabulary: ['lecture', 'alarm'], targetGrammar: ['inversion'] },
    { type: 'text', content: 'She is thought to have been working on the project for months.', instruction: 'Rewrite starting with "People think...".', targetVocabulary: ['project'], targetGrammar: ['passive_voice'] },
    { type: 'text', content: 'Much as I admire his talent, I cannot support his methods.', instruction: 'Rewrite using "although".', targetVocabulary: ['talent', 'methods'], targetGrammar: ['concession_clauses'] },
    { type: 'text', content: 'The proposal, controversial though it was, received unanimous approval.', instruction: 'Rewrite using "despite being".', targetVocabulary: ['proposal', 'approval'], targetGrammar: ['concession_clauses'] },
    { type: 'text', content: 'Only after reading the entire report did she understand the implications.', instruction: 'Rewrite without inversion.', targetVocabulary: ['report', 'implications'], targetGrammar: ['inversion'] },
  ],
};

const SITUATION_RESPONSE_PROMPTS: Record<string, GeneratedPrompt[]> = {
  A1: [
    { type: 'scenario', content: 'You are at a cafe. The waiter asks what you would like to drink.', instruction: 'Order a drink.', targetVocabulary: ['coffee', 'tea', 'water', 'please'], targetGrammar: ['polite_requests'] },
    { type: 'scenario', content: 'You meet someone new at a party.', instruction: 'Introduce yourself and ask their name.', targetVocabulary: ['name', 'nice to meet you'], targetGrammar: ['introductions'] },
    { type: 'scenario', content: 'You are lost in a city. You see a police officer.', instruction: 'Ask for directions to the train station.', targetVocabulary: ['excuse me', 'where', 'station'], targetGrammar: ['question_formation'] },
    { type: 'scenario', content: 'Your friend asks what you did yesterday.', instruction: 'Describe your day briefly.', targetVocabulary: ['yesterday', 'went', 'ate'], targetGrammar: ['past_simple'] },
    { type: 'scenario', content: 'You are at a shop and want to buy a shirt.', instruction: 'Ask the shop assistant about the price and size.', targetVocabulary: ['how much', 'size', 'shirt'], targetGrammar: ['question_formation'] },
  ],
  A2: [
    { type: 'scenario', content: 'Your colleague invites you to dinner, but you already have plans.', instruction: 'Decline politely and suggest another day.', targetVocabulary: ['sorry', 'busy', 'another time'], targetGrammar: ['polite_refusals'] },
    { type: 'scenario', content: 'You are at the doctor\'s office with a headache and sore throat.', instruction: 'Describe your symptoms.', targetVocabulary: ['headache', 'throat', 'since'], targetGrammar: ['present_perfect'] },
    { type: 'scenario', content: 'A tourist asks you about your city.', instruction: 'Recommend a popular place to visit.', targetVocabulary: ['recommend', 'visit', 'beautiful'], targetGrammar: ['should_for_advice'] },
    { type: 'scenario', content: 'You want to return a product you bought online.', instruction: 'Explain the problem and ask for a refund.', targetVocabulary: ['return', 'broken', 'refund'], targetGrammar: ['polite_requests'] },
    { type: 'scenario', content: 'Your friend is upset because they failed an exam.', instruction: 'Console them and give advice.', targetVocabulary: ['next time', 'study', 'don\'t worry'], targetGrammar: ['imperatives', 'should_for_advice'] },
  ],
  B1: [
    { type: 'scenario', content: 'You are in a job interview. The interviewer asks about your strengths and weaknesses.', instruction: 'Answer professionally.', targetVocabulary: ['strength', 'weakness', 'experience'], targetGrammar: ['present_perfect', 'conditionals'] },
    { type: 'scenario', content: 'You witness a minor car accident. A police officer asks you what happened.', instruction: 'Describe what you saw.', targetVocabulary: ['suddenly', 'crashed', 'turned'], targetGrammar: ['past_continuous', 'past_simple'] },
    { type: 'scenario', content: 'You disagree with a coworker\'s proposal in a meeting.', instruction: 'Express your disagreement diplomatically and suggest an alternative.', targetVocabulary: ['respect', 'however', 'alternative'], targetGrammar: ['conditionals', 'polite_disagreement'] },
    { type: 'scenario', content: 'A friend asks for your opinion on whether they should quit their job to travel.', instruction: 'Give balanced advice.', targetVocabulary: ['consider', 'on the other hand', 'worth'], targetGrammar: ['conditionals', 'should_for_advice'] },
    { type: 'scenario', content: 'You need to complain about noisy neighbors to your building manager.', instruction: 'Explain the situation and request action.', targetVocabulary: ['noise', 'disturbing', 'appreciate'], targetGrammar: ['present_perfect_continuous', 'polite_requests'] },
  ],
  B2: [
    { type: 'scenario', content: 'You are debating whether remote work is better than office work.', instruction: 'Argue in favor of remote work with specific examples.', targetVocabulary: ['flexibility', 'productivity', 'commute'], targetGrammar: ['conditionals', 'passive_voice'] },
    { type: 'scenario', content: 'A journalist interviews you about the impact of social media on young people.', instruction: 'Give a nuanced answer.', targetVocabulary: ['impact', 'nevertheless', 'acknowledge'], targetGrammar: ['concession_clauses', 'passive_voice'] },
    { type: 'scenario', content: 'You need to negotiate a salary increase with your manager.', instruction: 'Present your case persuasively.', targetVocabulary: ['contribution', 'performance', 'competitive'], targetGrammar: ['present_perfect', 'conditionals'] },
    { type: 'scenario', content: 'You are giving a presentation and someone challenges your data.', instruction: 'Respond confidently while acknowledging their point.', targetVocabulary: ['valid point', 'data suggests', 'furthermore'], targetGrammar: ['concession_clauses', 'passive_voice'] },
    { type: 'scenario', content: 'A friend asks you to explain the pros and cons of artificial intelligence.', instruction: 'Give a balanced overview.', targetVocabulary: ['automation', 'ethical', 'implications'], targetGrammar: ['passive_voice', 'conditionals'] },
  ],
};

const NARRATIVE_SPRINT_PROMPTS: Record<string, GeneratedPrompt[]> = {
  A1: [
    { type: 'text', content: 'My favorite day', instruction: 'Tell a story about your favorite day of the week and what you usually do.', targetVocabulary: ['morning', 'afternoon', 'evening'], targetGrammar: ['present_simple'] },
    { type: 'text', content: 'A picture of my family', instruction: 'Describe your family members and what they like to do.', targetVocabulary: ['family', 'brother', 'sister'], targetGrammar: ['present_simple', 'possessives'] },
    { type: 'text', content: 'My room', instruction: 'Describe your room. What things are in it? Where are they?', targetVocabulary: ['bed', 'desk', 'window', 'next to'], targetGrammar: ['prepositions', 'there_is_are'] },
  ],
  A2: [
    { type: 'text', content: 'A trip I took', instruction: 'Tell a story about a trip or vacation you took recently.', targetVocabulary: ['traveled', 'visited', 'enjoyed'], targetGrammar: ['past_simple', 'past_continuous'] },
    { type: 'text', content: 'My best friend', instruction: 'Describe your best friend. How did you meet? What do you do together?', targetVocabulary: ['met', 'personality', 'together'], targetGrammar: ['past_simple', 'present_simple'] },
    { type: 'text', content: 'A special meal', instruction: 'Describe a special meal you remember. What was it? Who was there?', targetVocabulary: ['delicious', 'cooked', 'celebrated'], targetGrammar: ['past_simple', 'adjectives'] },
  ],
  B1: [
    { type: 'text', content: 'A turning point', instruction: 'Describe a moment that changed your life or perspective.', targetVocabulary: ['realized', 'decision', 'consequence'], targetGrammar: ['past_perfect', 'conditionals'] },
    { type: 'text', content: 'The future of education', instruction: 'Argue whether technology will replace traditional classrooms.', targetVocabulary: ['technology', 'traditional', 'evolve'], targetGrammar: ['future_forms', 'conditionals'] },
    { type: 'text', content: 'An unexpected encounter', instruction: 'Tell a story about meeting someone unexpected and how it affected you.', targetVocabulary: ['stranger', 'coincidence', 'impression'], targetGrammar: ['past_narrative_tenses'] },
  ],
  B2: [
    { type: 'text', content: 'Ethical dilemma', instruction: 'Describe a situation where you had to make a difficult ethical choice. What did you decide and why?', targetVocabulary: ['dilemma', 'consequence', 'justify'], targetGrammar: ['conditionals', 'subjunctive'] },
    { type: 'text', content: 'Cultural identity', instruction: 'Discuss how your cultural background has shaped who you are today.', targetVocabulary: ['identity', 'heritage', 'influence'], targetGrammar: ['present_perfect', 'passive_voice'] },
    { type: 'text', content: 'A world without borders', instruction: 'Argue for or against a world with open borders. Consider economic, social, and cultural implications.', targetVocabulary: ['migration', 'sovereignty', 'integration'], targetGrammar: ['conditionals', 'passive_voice', 'concession_clauses'] },
  ],
};

function getPromptsForMode(mode: DrillMode): Record<string, GeneratedPrompt[]> {
  switch (mode) {
    case 'reformulation':
      return REFORMULATION_PROMPTS;
    case 'situation_response':
      return SITUATION_RESPONSE_PROMPTS;
    case 'narrative_sprint':
      return NARRATIVE_SPRINT_PROMPTS;
    default:
      return REFORMULATION_PROMPTS;
  }
}

export function generatePrompt(mode: DrillMode, language: string, cefrLevel: string): GeneratedPrompt {
  const prompts = getPromptsForMode(mode);
  const levelPrompts = prompts[cefrLevel] || prompts['A1'] || [];

  if (levelPrompts.length === 0) {
    return {
      type: 'text',
      content: 'Hello, how are you today?',
      instruction: 'Respond to this greeting.',
      targetVocabulary: [],
      targetGrammar: [],
    };
  }

  const randomIndex = Math.floor(Math.random() * levelPrompts.length);
  return levelPrompts[randomIndex];
}
