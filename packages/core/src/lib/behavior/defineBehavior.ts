import type {
  MeshGradientBehavior,
  MeshGradientAttributes,
  MeshGradientUniforms,
} from '../../types'

export const defineBehavior = <
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes
>(
  behavior: MeshGradientBehavior<Uniforms, Attributes>
): MeshGradientBehavior<Uniforms, Attributes> => behavior
