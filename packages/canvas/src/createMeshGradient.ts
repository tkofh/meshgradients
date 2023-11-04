import { configureMeshGradient } from '@meshgradients/core'
import type { MeshGradientOptions } from '@meshgradients/core'
import { createStage } from '@webgl-tools/stage'

export const createMeshGradient = (
  options: MeshGradientOptions,
  canvas?: HTMLCanvasElement | null
) => {
  const configuration = configureMeshGradient(options)

  console.log(configuration.vertexShader)
  console.log(configuration.fragmentShader)

  const stage = createStage({
    canvas,
    attributes: {
      ...configuration.attributes,
      // a_color: {
      //   data: new Float32Array(
      //     Array.from({ length: configuration.attributes.a_t.data.length * 3 }, () => Math.random())
      //   ),
      //   size: 3,
      //   usage: 'STATIC_DRAW',
      // },
    },
    elements: {
      data: configuration.triangles,
      mode: 'TRIANGLES',
      type: 'UNSIGNED_SHORT',
    },
    uniforms: {
      ...configuration.uniforms,
    },
    vertexShader: configuration.vertexShader,
    fragmentShader: configuration.fragmentShader,
    observeResize: true,
  })

  if (stage instanceof Error) {
    throw new TypeError(`Failed to create Mesh Gradient: ${stage.message}`)
  }

  stage.render()
}
