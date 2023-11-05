import type { MeshGradientConfig, MeshGradientOptions } from './types'
import { resolveOptions, createGeometry } from './lib'
import { compileShaders } from './lib/shaders/compileShaders'

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

  const out = {
    triangles: geometry.triangles,
    attributes: {
      ...behaviorAttributes,
      [builtinAttributeNames.controlPointStartIndex]: {
        size: 1,
        data: geometry.pointControlPointStartIndices,
      },
      [builtinAttributeNames.t]: {
        size: 2,
        data: geometry.pointTValues,
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
  } satisfies MeshGradientConfig

  console.log(out)

  return out
}
