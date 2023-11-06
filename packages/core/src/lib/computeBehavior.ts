import type { BehaviorModifiers, BehaviorSetup, BehaviorSetupContext } from '../types/behavior'
import type { MeshGradientAttributes, MeshGradientUniforms } from '../types/mesh'

export const computeBehavior = (context: BehaviorSetupContext, behaviors: BehaviorSetup[]) => {
  const behaviorAttributes: MeshGradientAttributes = {}
  const behaviorUniforms: MeshGradientUniforms = {}

  const modifiers: BehaviorModifiers = {
    controlPointPositions: [],
    position: [],
    color: [],
  }

  for (const behavior of behaviors) {
    const result = behavior(context)

    if ('attributes' in result) {
      for (const [key, attribute] of Object.entries(result.attributes)) {
        behaviorAttributes[key] = attribute
      }
    }
    if ('uniforms' in result) {
      for (const [key, uniform] of Object.entries(result.uniforms)) {
        behaviorUniforms[key] = uniform
      }
    }

    if ('controlPointPositions' in result) {
      modifiers.controlPointPositions.push(result.controlPointPositions)
    }
    if ('position' in result) {
      modifiers.position.push(result.position)
    }
    if ('color' in result) {
      modifiers.color.push(result.color)
    }
  }

  return {
    modifiers,
    behaviorAttributes,
    behaviorUniforms,
  }
}
