import { attribute, literal, varying } from '@webgl-tools/glsl-nodes'
import { defineBehavior } from '../../lib/behavior'

export const randomColors = defineBehavior((context) => {
  const data = new Float32Array(
    Array.from({ length: context.geometry.pointCount.x * context.geometry.pointCount.y * 3 }, () =>
      Math.random()
    )
  )

  const aColor = attribute('vec3', context.namer.attribute('color'))
  const vColor = varying('vec3', context.namer.varying('color'), aColor)

  return {
    attributes: {
      [aColor.expression]: {
        data,
        size: 3,
      },
    },
    uniforms: {},
    color: literal('vec4', [vColor, literal('float', ['1.0'])]),
    position: context.position,
  }
})
