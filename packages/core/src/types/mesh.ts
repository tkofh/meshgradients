import type { ArrayNode, DataNode, StorageType } from '@webgl-tools/glsl-nodes'
import type { Vector2 } from './common'
import type { BehaviorSetup } from './behavior'

export interface MeshGradientShaderCreateInputs {
  position: DataNode<'vec2', 'attribute'>
}

export interface MeshGradientShader {
  position: DataNode<'vec4'>
  color: DataNode<'vec4', Exclude<StorageType, 'attribute'>>
}

export type MeshGradientShaderCreator = (
  inputs: MeshGradientShaderCreateInputs
) => MeshGradientShader

export interface MeshGradientOptions {
  subdivisions: number | Vector2
  points: number | Vector2
  behaviors?: BehaviorSetup[]
}

export interface ResolvedMeshGradientOptions {
  subdivisions: Vector2
  points: Vector2
  behaviors: BehaviorSetup[]
}

export interface MeshGradientGeometry {
  readonly controlPointCount: Readonly<Vector2>
  readonly pointCount: Readonly<Vector2>

  readonly controlPointPositions: Float32Array
  readonly uvs: Float32Array
  readonly pointTValues: Float32Array
  readonly pointControlPointStartIndices: Float32Array

  readonly triangles: Uint16Array
}

export type MeshGradientUniform =
  | {
      type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4'
      data: Float32List
    }
  | {
      type: 'int' | 'sampler2D' | 'samplerCube' | 'ivec2' | 'ivec3' | 'ivec4'
      data: Int32List
    }

export interface MeshGradientAttribute {
  size: number
  data: Float32Array
  usage?: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW'
}

export interface MeshGradientAttributes {
  [TAttribute: string]: MeshGradientAttribute
}

export interface MeshGradientUniforms {
  [TUniform: string]: MeshGradientUniform
}

export interface MeshGradientConfig {
  triangles: Uint16Array
  vertexShader: string
  fragmentShader: string
  uniforms: MeshGradientUniforms
  attributes: MeshGradientAttributes
}

export interface MeshGradientGlobalAttributes {
  controlPointStartIndex: DataNode<'float', 'attribute'>
  t: DataNode<'vec2', 'attribute'>
  uv: DataNode<'vec2', 'attribute'>
}
export interface MeshGradientGlobalUniforms {
  controlPointInitialPositions: ArrayNode<'vec2', 'uniform'>
  time: DataNode<'float', 'uniform'>
}
export interface MeshGradientGlobalVaryings {
  uv: DataNode<'vec2', 'varying'>
}
