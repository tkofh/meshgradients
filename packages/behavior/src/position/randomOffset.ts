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
    const frequencyMax = options.frequency?.max ?? 3

    const amplitude = uniformArray('float', context.namer.uniform('amplitude'), controlPointCount)
    const amplitudeData: number[] = []

    const frequency = uniformArray('float', context.namer.uniform('frequency'), controlPointCount)
    const frequencyData: number[] = []

    for (let y = 0; y < context.geometry.controlPointCount.y; y++) {
      const isFrameY = y === 1 || y === context.geometry.controlPointCount.y - 2
      const isFrameStructureY =
        isFrameY || y === 0 || y === context.geometry.controlPointCount.y - 1
      for (let x = 0; x < context.geometry.controlPointCount.x; x++) {
        let fix = true
        const isFrameX = x === 1 || x === context.geometry.controlPointCount.x - 2

        const isFrameStructureX =
          isFrameX || x === 0 || x === context.geometry.controlPointCount.x - 1

        fix =
          isFrameStructureX ||
          isFrameStructureY ||
          (isFrameStructureX && options.axis === 'y') ||
          (isFrameStructureY && options.axis === 'x')

        if (fix) {
          amplitudeData.push(0)
          frequencyData.push(0)
        } else {
          amplitudeData.push(
            lerp(Math.random(), amplitudeMin, amplitudeMax) * (Math.random() > 0.5 ? 1 : -1)
          )
          frequencyData.push(lerp(Math.random(), frequencyMin, frequencyMax))
        }
      }
    }

    const localAmplitude = variable(
      'mat4',
      context.namer.variable('amplitude'),
      controlPointIndices.map((index) =>
        accessArray(
          amplitude,
          add(context.globalVariables.controlPointStartIndex, literal('int', [String(index)]))
        )
      ) as ArrayWithOne<DataNode<'float', 'literal' | 'uniform'>>
    )
    const localFrequency = variable(
      'mat4',
      context.namer.variable('frequency'),
      controlPointIndices.map((index) =>
        accessArray(
          frequency,
          add(context.globalVariables.controlPointStartIndex, literal('int', [String(index)]))
        )
      ) as ArrayWithOne<DataNode<'float', 'literal' | 'uniform'>>
    )

    const inputs = variable(
      'mat4',
      context.namer.variable('inputs'),
      multiply(localFrequency, context.globalUniforms.time)
    )

    const offsets = // multiply(
      literal('mat4', [
        // sin(context.globalUniforms.time),
        multiply(sin(access(inputs, '[0][0]')), access(localAmplitude, '[0][0]')),
        multiply(sin(access(inputs, '[0][1]')), access(localAmplitude, '[0][1]')),
        multiply(sin(access(inputs, '[0][2]')), access(localAmplitude, '[0][2]')),
        multiply(sin(access(inputs, '[0][3]')), access(localAmplitude, '[0][3]')),
        multiply(sin(access(inputs, '[1][0]')), access(localAmplitude, '[1][0]')),
        multiply(sin(access(inputs, '[1][1]')), access(localAmplitude, '[1][1]')),
        multiply(sin(access(inputs, '[1][2]')), access(localAmplitude, '[1][2]')),
        multiply(sin(access(inputs, '[1][3]')), access(localAmplitude, '[1][3]')),
        multiply(sin(access(inputs, '[2][0]')), access(localAmplitude, '[2][0]')),
        multiply(sin(access(inputs, '[2][1]')), access(localAmplitude, '[2][1]')),
        multiply(sin(access(inputs, '[2][2]')), access(localAmplitude, '[2][2]')),
        multiply(sin(access(inputs, '[2][3]')), access(localAmplitude, '[2][3]')),
        multiply(sin(access(inputs, '[3][0]')), access(localAmplitude, '[3][0]')),
        multiply(sin(access(inputs, '[3][1]')), access(localAmplitude, '[3][1]')),
        multiply(sin(access(inputs, '[3][2]')), access(localAmplitude, '[3][2]')),
        multiply(sin(access(inputs, '[3][3]')), access(localAmplitude, '[3][3]')),
      ]) //,
    // localAmplitude
    // )

    return {
      uniforms: {
        [amplitude.expression]: { type: 'float', data: new Float32Array(amplitudeData) },
        [frequency.expression]: { type: 'float', data: new Float32Array(frequencyData) },
      },
      controlPointPositions: (controlPointPositions) => ({
        // x: options.axis === 'x' ? add(controlPointPositions.x, offsets) : controlPointPositions.x,
        // y: options.axis === 'y' ? add(controlPointPositions.y, offsets) : controlPointPositions.y,
        x: options.axis === 'x' ? add(controlPointPositions.x, offsets) : controlPointPositions.x,
        y: options.axis === 'y' ? add(controlPointPositions.y, offsets) : controlPointPositions.y,
      }),
    }
  })
