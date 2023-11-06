import type { MeshGradientConfig, MeshGradientOptions } from '../types/mesh'
import { compileShaders } from './compileShaders'
import { resolveOptions } from './resolveOptions'
import { createGeometry } from './createGeometry'

export const configureMeshGradient = (options: MeshGradientOptions): MeshGradientConfig => {
  const result = resolveOptions(options)

  if (result.success === false) {
    throw new TypeError(`Failed to create Mesh Gradient:\n\n* ${result.messages.join(`\n* `)}`)
  }

  const resolvedOptions = result.options

  const geometry = createGeometry(resolvedOptions.points, resolvedOptions.subdivisions)

  const {
    vertexShader,
    fragmentShader,
    builtinUniformNames,
    builtinAttributeNames,
    behaviorAttributes,
    behaviorUniforms,
  } = compileShaders(geometry, resolvedOptions.behaviors)

  return {
    triangles: geometry.triangles,
    attributes: {
      ...behaviorAttributes,
      [builtinAttributeNames.controlPointStartIndex]: {
        size: 1,
        data: geometry.pointControlPointStartIndices,
        usage: 'STATIC_DRAW',
      },
      [builtinAttributeNames.t]: {
        size: 2,
        data: geometry.pointTValues,
        usage: 'STATIC_DRAW',
      },
      [builtinAttributeNames.uv]: {
        size: 2,
        data: geometry.uvs,
        usage: 'STATIC_DRAW',
      },
    },
    uniforms: {
      ...behaviorUniforms,
      [builtinUniformNames.controlPointPositions]: {
        type: 'vec2',
        data: geometry.controlPointPositions,
      },
    },
    vertexShader,
    fragmentShader,
  }
}
