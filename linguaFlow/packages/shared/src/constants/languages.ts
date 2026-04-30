export const SUPPORTED_LANGUAGES = {
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  'nl-BE': { name: 'Flemish', nativeName: 'Vlaams', flag: '🇧🇪' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];

/** Languages available for learning in Phase 1 */
export const PHASE1_LANGUAGES: LanguageCode[] = ['es', 'fr', 'nl-BE', 'en'];
