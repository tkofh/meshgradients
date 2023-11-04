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

  const { vertexShader, fragmentShader, UNIFORM_NAMES, ATTRIBUTE_NAMES } = compileShaders(
    geometry,
    []
  )

  const out = {
    triangles: geometry.triangles,
    attributes: {
      [ATTRIBUTE_NAMES.CONTROL_POINT_START_INDEX]: {
        size: 1,
        data: geometry.pointControlPointStartIndices,
      },
      [ATTRIBUTE_NAMES.T]: {
        size: 2,
        data: geometry.pointTValues,
      },
    },
    uniforms: {
      [UNIFORM_NAMES.CONTROL_POINT_POSITIONS]: {
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
