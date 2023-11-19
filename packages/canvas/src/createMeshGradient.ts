import { configureMeshGradient } from '@meshgradients/core'
import type { MeshGradientOptions } from '@meshgradients/core'
import { createStage } from '@webgl-tools/stage'

export const createMeshGradient = (
  options: MeshGradientOptions,
  canvas?: HTMLCanvasElement | null,
  debug = false
) => {
  const configuration = configureMeshGradient(options)

  const stage = createStage({
    canvas,
    attributes: configuration.attributes,
    elements: {
      data: configuration.triangles,
      mode: debug ? 'LINES' : 'TRIANGLES',
      type: 'UNSIGNED_SHORT',
    },
    uniforms: configuration.uniforms,
    vertexShader: configuration.vertexShader,
    fragmentShader: configuration.fragmentShader,
    observeResize: true,
  })

  if (stage instanceof Error) {
    throw new TypeError(`Failed to create Mesh Gradient: ${stage.message}`)
  }

  stage.render()

  return {
    render: (time: number) => {
      const data = stage.uniforms[configuration.globalUniformNames.time].data
      data[0] = time * 0.001
      stage.setUniform(configuration.globalUniformNames.time, data)

      stage.render()
    },
  }
}
