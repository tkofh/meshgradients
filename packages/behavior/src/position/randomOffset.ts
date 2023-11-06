import { defineBehavior } from '@meshgradients/core'
import { lerp } from 'micro-math'
import {
  add,
  multiply,
  literal,
  access,
  sin,
  uniformArray,
  variable,
  swizzle,
  accessArray,
} from '@webgl-tools/glsl-nodes'
import type { DataNode } from '@webgl-tools/glsl-nodes'

type ArrayWithOne<T> = [T, ...T[]]

interface Range {
  min: number
  max: number
}

interface Options {
  axis: 'x' | 'y'
  amplitude?: Range
  frequency?: Range
}

export const randomOffset = (options: Options) =>
  defineBehavior((context) => {
    const controlPointCount =
      context.geometry.controlPointCount.x * context.geometry.controlPointCount.y

    const controlPointIndices = [
      0,
      1,
      2,
      3,
      context.geometry.controlPointCount.x,
      context.geometry.controlPointCount.x + 1,
      context.geometry.controlPointCount.x + 2,
      context.geometry.controlPointCount.x + 3,
      context.geometry.controlPointCount.x * 2,
      context.geometry.controlPointCount.x * 2 + 1,
      context.geometry.controlPointCount.x * 2 + 2,
      context.geometry.controlPointCount.x * 2 + 3,
      context.geometry.controlPointCount.x * 3,
      context.geometry.controlPointCount.x * 3 + 1,
      context.geometry.controlPointCount.x * 3 + 2,
      context.geometry.controlPointCount.x * 3 + 3,
    ]

    const amplitudeMin = options.amplitude?.min ?? 0
    const amplitudeMax =
      options.amplitude?.max ?? 1 / (context.geometry.controlPointCount[options.axis] - 1)

    const frequencyMin = options.frequency?.min ?? 0
    const frequencyMax = options.frequency?.max ?? 0.5

    const offsetParams = uniformArray(
      'vec3',
      context.namer.uniform('offset_params'),
      controlPointCount
    )
    const offsetData: number[] = []
    for (let i = 0; i < controlPointCount; i++) {
      offsetData.push(
        Math.random() * Math.PI * 2,
        lerp(Math.random(), amplitudeMin, amplitudeMax),
        lerp(Math.random(), frequencyMin, frequencyMax)
      )
    }

    const accessOffsetParams = (axis: 'x' | 'y' | 'z', name: string) =>
      variable(
        'mat4',
        context.namer.variable(name),
        controlPointIndices.map((index) =>
          swizzle(
            accessArray(
              offsetParams,
              add(context.globalVariables.controlPointStartIndex, literal('int', [String(index)]))
            ),
            axis
          )
        ) as ArrayWithOne<DataNode<'float', 'literal' | 'uniform'>>
      )

    const inputs = multiply(
      add(accessOffsetParams('x', 'offsets'), context.globalUniforms.time),
      accessOffsetParams('z', 'frequencies')
    )
    const offsets = multiply(
      literal('mat4', [
        sin(access(inputs, '[0]')),
        sin(access(inputs, '[1]')),
        sin(access(inputs, '[2]')),
        sin(access(inputs, '[3]')),
      ]),
      accessOffsetParams('y', 'amplitudes')
    )

    return {
      uniforms: {
        [offsetParams.expression]: {
          type: 'vec3',
          data: new Float32Array(offsetData),
        },
      },
      controlPointPositions: (controlPointPositions) => ({
        x: options.axis === 'x' ? add(controlPointPositions.x, offsets) : controlPointPositions.x,
        y: options.axis === 'y' ? add(controlPointPositions.y, offsets) : controlPointPositions.y,
      }),
    }
  })
