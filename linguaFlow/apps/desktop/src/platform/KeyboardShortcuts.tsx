/**
 * Desktop keyboard shortcuts (Phase 3)
 *
 * Global shortcuts for desktop navigation:
 * - Ctrl+1-5: Switch between tabs (Home, Learn, Review, Practice, Profile)
 * - Ctrl+R: Start SRS review session
 * - Ctrl+D: Start Pressure Cooker drill
 * - Space: Flip flashcard / Play audio
 * - 1-4: Rate flashcard (Again/Hard/Good/Easy)
 * - Enter: Submit answer / Continue
 * - Escape: Back / Cancel
 */

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: '1', ctrl: true, description: 'Go to Home', action: 'navigate:home' },
  { key: '2', ctrl: true, description: 'Go to Learn', action: 'navigate:learn' },
  { key: '3', ctrl: true, description: 'Go to Review', action: 'navigate:review' },
  { key: '4', ctrl: true, description: 'Go to Practice', action: 'navigate:practice' },
  { key: '5', ctrl: true, description: 'Go to Profile', action: 'navigate:profile' },
  { key: 'r', ctrl: true, description: 'Start review', action: 'action:startReview' },
  { key: 'd', ctrl: true, description: 'Start drill', action: 'action:startDrill' },
  { key: ' ', description: 'Flip card / Play audio', action: 'action:flip' },
  { key: '1', description: 'Rate: Again', action: 'rate:1' },
  { key: '2', description: 'Rate: Hard', action: 'rate:2' },
  { key: '3', description: 'Rate: Good', action: 'rate:3' },
  { key: '4', description: 'Rate: Easy', action: 'rate:4' },
  { key: 'Enter', description: 'Submit / Continue', action: 'action:submit' },
  { key: 'Escape', description: 'Back / Cancel', action: 'action:back' },
];
