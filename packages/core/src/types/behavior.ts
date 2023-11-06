import type { DataNode, Namer, StorageType } from '@webgl-tools/glsl-nodes'
import type { Emitter } from 'mitt'
import type {
  MeshGradientAttributes,
  MeshGradientGlobalAttributes,
  MeshGradientGlobalUniforms,
  MeshGradientUniforms,
  MeshGradientGeometry,
  MeshGradientGlobalVaryings,
} from './mesh'

export type BehaviorSetupEmitter = Emitter<{ render: never }>

export interface BehaviorSetupResult {
  attributes: MeshGradientAttributes
  uniforms: MeshGradientUniforms
  position: DataNode<'vec3'>
  color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
}

export interface BehaviorSetupContext extends Omit<BehaviorSetupEmitter, 'emit' | 'all'> {
  readonly namer: Namer
  readonly position: DataNode<'vec3'>
  readonly color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
  readonly globalAttributes: Readonly<MeshGradientGlobalAttributes>
  readonly globalUniforms: Readonly<MeshGradientGlobalUniforms>
  readonly globalVaryings: Readonly<MeshGradientGlobalVaryings>
  readonly geometry: Readonly<MeshGradientGeometry>
}

export type BehaviorSetup = (context: BehaviorSetupContext) => BehaviorSetupResult
