import type { Crushly } from '../state/useCrushly'
import type { Dispatch, Overlay } from '../state/types'

export interface Props {
  ui: Crushly['ui']
  dispatch: Dispatch
  /** Opens a conversation overlay (Messages tab + celebrations use it). */
  onOpenConv?: (profileId: string) => void
  /** Opens a full-screen panel above the tab shell. */
  onOpen?: (o: Overlay) => void
}
