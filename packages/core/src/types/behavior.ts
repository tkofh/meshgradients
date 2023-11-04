import type { DataNode, Namer, StorageType } from '@webgl-tools/glsl-nodes'
import type { Emitter } from 'mitt'
import type { MeshGradientAttributes, MeshGradientUniforms } from './mesh'

interface RenderHandlerContext<
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes,
> {
  uniforms: Uniforms
  attributes: Attributes
}

type BehaviorSetupEmitter<
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes,
> = Emitter<{
  render: RenderHandlerContext<Uniforms, Attributes>
}>

export interface BehaviorSetupResult {
  position: DataNode<'vec3'>
  color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
}

export interface BehaviorSetupContext<
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes,
> extends BehaviorSetupResult,
    Omit<BehaviorSetupEmitter<Uniforms, Attributes>, 'emit' | 'all'> {
  namer: Namer
  attributes: Attributes
  uniforms: Uniforms
}

type BehaviorSetup<
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes,
> = (context: BehaviorSetupContext<Uniforms, Attributes>) => BehaviorSetupResult

export interface MeshGradientBehavior<
  Uniforms extends MeshGradientUniforms,
  Attributes extends MeshGradientAttributes,
> {
  uniforms: Uniforms
  attributes: Attributes
  setup: BehaviorSetup<Uniforms, Attributes>
}
