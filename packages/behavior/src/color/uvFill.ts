import { defineBehavior } from '@meshgradients/core'
import { literal, swizzle, type DataNode } from '@webgl-tools/glsl-nodes'
import { resolveDynamicFloat, type DynamicFloat } from '../shared'

interface Options {
  // rotate?: DynamicFloat
  format?: 'ur/vg' | 'ug/vr' | 'ug/vb' | 'ub/vg' | 'ub/vr' | 'ur/vb'
  offset?: DynamicFloat
  scale?: DynamicFloat
  constant?: DynamicFloat
}

export const uvFill = (options: Options) =>
  defineBehavior((context) => {
    const format = options.format ?? 'ur/vg'

    // const scale = resolveDynamicFloat(options.scale ?? 0, context)
    // const offset = resolveDynamicFloat(options.offset ?? 0, context)
    const constant = resolveDynamicFloat(options.constant ?? 0, context)

    const lookup: Record<Options['format'], DataNode<'vec3'>> = {
      get 'ur/vg'() {
        return literal('vec3', [context.globalVaryings.uv, constant])
      },
      get 'ug/vb'() {
        return literal('vec3', [constant, context.globalVaryings.uv])
      },
      get 'ug/vr'() {
        return literal('vec3', [swizzle(context.globalVaryings.uv, 'yx'), constant])
      },
      get 'ub/vg'() {
        return literal('vec3', [constant, swizzle(context.globalVaryings.uv, 'yx')])
      },
      get 'ur/vb'() {
        return literal('vec3', [
          swizzle(context.globalVaryings.uv, 'x'),
          constant,
          swizzle(context.globalVaryings.uv, 'y'),
        ])
      },
      get 'ub/vr'() {
        return literal('vec3', [
          swizzle(context.globalVaryings.uv, 'y'),
          constant,
          swizzle(context.globalVaryings.uv, 'x'),
        ])
      },
    }

    const rgb = lookup[format]

    const color: DataNode<'vec4', 'literal' | 'varying'> = literal('vec4', [rgb, '1.0'])

    return {
      position: context.position,
      color,
      attributes: {},
      uniforms: {},
    }
  })
