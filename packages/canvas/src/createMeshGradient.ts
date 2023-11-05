import { configureMeshGradient } from '@meshgradients/core'
import type { MeshGradientOptions } from '@meshgradients/core'
import { createStage } from '@webgl-tools/stage'

export const createMeshGradient = (
  options: MeshGradientOptions,
  canvas?: HTMLCanvasElement | null
) => {
  const configuration = configureMeshGradient(options)

  const stage = createStage({
    canvas,
    attributes: configuration.attributes,
    elements: {
      data: configuration.triangles,
      mode: 'TRIANGLES',
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

  console.log(stage.vertexShader)
  console.log('')
  console.log(stage.fragmentShader)

  stage.render()
}
