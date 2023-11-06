import type { BehaviorSetupContext } from '@meshgradients/core'
import type { DataNode, StorageType } from '@webgl-tools/glsl-nodes'
import { literal } from '@webgl-tools/glsl-nodes'

export type DynamicFloat<TStorage extends StorageType = StorageType> =
  | number
  | DataNode<'float', TStorage>
  | ((context: BehaviorSetupContext) => DataNode<'float', TStorage>)

export const resolveDynamicFloat = <TStorage extends StorageType = StorageType>(
  value: DynamicFloat<TStorage>,
  context: BehaviorSetupContext
): DataNode<'float', 'literal' | TStorage> => {
  if (typeof value === 'number') {
    return literal('float', [Math.round(value) === value ? `${value}.0` : String(value)])
  } else if (typeof value === 'function') {
    return value(context)
  } else {
    return value
  }
}
