import type { Emitter } from 'mitt'
import type { DataNode, Namer, StorageType } from '@webgl-tools/glsl-nodes'
import type {
  MeshGradientAttributes,
  MeshGradientGlobalAttributes,
  MeshGradientGlobalUniforms,
  MeshGradientUniforms,
  MeshGradientGeometry,
  MeshGradientGlobalVaryings,
  MeshGradientGlobalVariables,
} from './mesh'

export type BehaviorSetupEmitter = Emitter<{ render: never }>

interface ControlPointPositionData {
  x: DataNode<'mat4'>
  y: DataNode<'mat4'>
}

type ControlPointPositionModifier = (
  controlPointPositions: ControlPointPositionData
) => ControlPointPositionData

type PositionModifier = (position: DataNode<'vec3'>) => DataNode<'vec3'>
type ColorModifier = (
  color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
) => DataNode<'vec4', Exclude<StorageType, 'attribute'>>

export interface BehaviorSetupResult {
  attributes?: MeshGradientAttributes
  uniforms?: MeshGradientUniforms
  controlPointPositions?: ControlPointPositionModifier
  position?: PositionModifier
  color?: ColorModifier
}

export interface BehaviorModifiers {
  controlPointPositions: ControlPointPositionModifier[]
  position: PositionModifier[]
  color: ColorModifier[]
}

export interface BehaviorSetupContext extends Omit<BehaviorSetupEmitter, 'emit' | 'all'> {
  readonly namer: Namer
  // readonly position: DataNode<'vec3'>
  // readonly color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
  readonly globalAttributes: Readonly<MeshGradientGlobalAttributes>
  readonly globalUniforms: Readonly<MeshGradientGlobalUniforms>
  readonly globalVaryings: Readonly<MeshGradientGlobalVaryings>
  readonly globalVariables: Readonly<MeshGradientGlobalVariables>
  readonly geometry: Readonly<MeshGradientGeometry>
}

export type BehaviorSetup = (context: BehaviorSetupContext) => BehaviorSetupResult
