import type { Crushly } from '../state/useCrushly'
import type { Dispatch } from '../state/types'

export interface Props {
  ui: Crushly['ui']
  dispatch: Dispatch
}
