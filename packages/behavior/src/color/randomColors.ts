import type { DataNode } from '@webgl-tools/glsl-nodes'
import {
  attribute,
  literal,
  varying,
  add,
  multiply,
  swizzle,
  subtract,
} from '@webgl-tools/glsl-nodes'
import { defineBehavior } from '@meshgradients/core'
import { convertHSLToRGB } from '@chromatika/core'
import { lerp, normalize } from 'micro-math'

type DimensionRange = number | { min?: number; max?: number }

interface BaseOptions {
  alpha: DimensionRange
}

interface HSLOptions extends BaseOptions {
  hue: DimensionRange
  saturation: DimensionRange
  lightness: DimensionRange
}

interface RGBOptions extends BaseOptions {
  red: DimensionRange
  green: DimensionRange
  blue: DimensionRange
}

type Options = HSLOptions | RGBOptions

const toMinMax = (range: DimensionRange) =>
  typeof range === 'number'
    ? { min: range, max: range }
    : { min: range.min ?? 0, max: range.max ?? 1 }

export const randomColors = (options: Options) =>
  defineBehavior((context) => {
    const colors: number[] = []
    const alpha = toMinMax(options.alpha)

    const fixedAlpha = alpha.min === alpha.max
    if ('hue' in options) {
      const hue = toMinMax(options.hue)
      const saturation = toMinMax(options.saturation)
      const lightness = toMinMax(options.lightness)
      for (let i = 0; i < context.geometry.pointCount.x * context.geometry.pointCount.y; i++) {
        const rgb = convertHSLToRGB({
          hue: lerp(Math.random(), hue.min, hue.max),
          saturation: lerp(Math.random(), saturation.min, saturation.max),
          lightness: lerp(Math.random(), lightness.min, lightness.max),
        })
        colors.push(
          normalize(rgb.red, 0, 255),
          normalize(rgb.green, 0, 255),
          normalize(rgb.blue, 0, 255)
        )
        if (!fixedAlpha) {
          colors.push(lerp(Math.random(), alpha.min, alpha.max))
        }
      }
    } else {
      const red = toMinMax(options.red)
      const green = toMinMax(options.green)
      const blue = toMinMax(options.blue)

      const normalizedRed = { min: normalize(red.min, 0, 255), max: normalize(red.max, 0, 255) }
      const normalizedGreen = {
        min: normalize(green.min, 0, 255),
        max: normalize(green.max, 0, 255),
      }
      const normalizedBlue = { min: normalize(blue.min, 0, 255), max: normalize(blue.max, 0, 255) }

      for (let i = 0; i < context.geometry.pointCount.x * context.geometry.pointCount.y; i++) {
        colors.push(
          lerp(Math.random(), normalizedRed.min, normalizedRed.max),
          lerp(Math.random(), normalizedGreen.min, normalizedGreen.max),
          lerp(Math.random(), normalizedBlue.min, normalizedBlue.max)
        )
        if (!fixedAlpha) {
          colors.push(lerp(Math.random(), alpha.min, alpha.max))
        }
      }
    }

    const aColor = attribute(fixedAlpha ? 'vec3' : 'vec4', context.namer.attribute('color'))
    const vColor = varying(fixedAlpha ? 'vec3' : 'vec4', context.namer.varying('color'), aColor)

    return {
      attributes: {
        [aColor.expression]: {
          data: new Float32Array(colors),
          size: fixedAlpha ? 3 : 4,
          usage: 'STATIC_DRAW',
        },
      },
      color: (color) => {
        if (fixedAlpha && alpha.min === 1) {
          return literal('vec4', [vColor as DataNode<'vec3'>, '1.0'])
        } else {
          let randomScalar: DataNode<'float', 'literal' | 'varying'>
          let randomColor: DataNode<'vec3', 'literal' | 'varying'>
          let otherScalar: DataNode<'float', 'literal' | 'varying'>
          if (fixedAlpha) {
            randomScalar = literal('float', [String(alpha.min)])
            randomColor = vColor as DataNode<'vec3', 'varying'>
            otherScalar = literal('float', [String(1 - alpha.min)])
          } else {
            randomScalar = swizzle(vColor as DataNode<'vec4', 'varying'>, 'w')
            randomColor = swizzle(vColor as DataNode<'vec4', 'varying'>, 'xyz')
            otherScalar = subtract(
              literal('float', ['1.0']),
              swizzle(vColor as DataNode<'vec4', 'varying'>, 'w')
            )
          }
          return literal('vec4', [
            add(multiply(randomColor, randomScalar), multiply(swizzle(color, 'xyz'), otherScalar)),
            '1.0',
          ])
        }
      },
    }
  })
