import type { UiState } from './useCrushly'

/**
 * The only write surface the UI has. Every action is named after the
 * conventional concept (§38); the Crushly word is applied when rendering.
 */
export type Action =
  | { type: 'crush'; profileId: string; big: boolean }
  | { type: 'pass'; profileId: string }
  | { type: 'keepClose'; profileId: string }
  | { type: 'letGo'; profileId: string }
  | { type: 'askClose'; profileId: string }
  | { type: 'confirmCutOff'; profileId: string }
  | { type: 'letBackIn'; profileId: string }
  | { type: 'confirmFlag'; profileId: string }
  | { type: 'unclick'; profileId: string }
  | { type: 'sendWhisper'; profileId: string; body: string }
  | { type: 'shareMoment'; body: string }
  | { type: 'shareVibe'; label: string }
  | { type: 'saveMoment'; postId: string }
  | { type: 'setPreference'; key: 'discoverable' | 'showDistance' | 'showOnlineStatus'; value: boolean }
  | { type: 'openSpace'; profileId: string | null }
  | { type: 'confirm'; kind: UiState['confirm'] }
  | { type: 'dismissAlert'; id: number }

export type Dispatch = (a: Action) => void
