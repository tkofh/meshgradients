import type { DataNode } from '@webgl-tools/glsl-nodes'
import {
  access,
  createProgram,
  createNamer,
  uniformArray,
  attribute,
  constant,
  literal,
  swizzle,
  variable,
  cast,
  multiply,
  pow,
  dot,
  accessArray,
  add,
  output,
  varying,
  uniform,
} from '@webgl-tools/glsl-nodes'
import mitt from 'mitt'
import type { BehaviorSetup, BehaviorSetupEmitter } from '../types/behavior'
import type { MeshGradientGeometry } from '../types/mesh'
import { computeBehavior } from './computeBehavior'

export const compileShaders = (geometry: MeshGradientGeometry, behaviors: BehaviorSetup[]) => {
  const namer = createNamer()

  const builtinUniformNames = {
    controlPointInitialPositions: namer.uniform('controlPointInitialPositions'),
    time: namer.uniform('time'),
  } as const

  const builtinAttributeNames = {
    controlPointStartIndex: namer.attribute('controlPointStartIndex'),
    t: namer.attribute('t'),
    uv: namer.attribute('uv'),
  } as const

  const builtinVaryingNames = {
    uv: namer.varying('uv'),
  } as const

  const builtinConstNames = {
    identityMatrix: namer.constant('IDENTITY_MATRIX'),
  } as const

  const controlPointInitialPositions = uniformArray(
    'vec2',
    builtinUniformNames.controlPointInitialPositions,
    geometry.controlPointCount.x * geometry.controlPointCount.y
  )

  const controlPointStartIndex = attribute('float', builtinAttributeNames.controlPointStartIndex)
  const t = attribute('vec2', builtinAttributeNames.t)

  const identityMatrix = constant(
    'mat4',
    builtinConstNames.identityMatrix,
    literal('mat4', [
      '0.0',
      '-0.5',
      '1.0',
      '-0.5',
      '1.0',
      '0.0',
      '-2.5',
      '1.5',
      '0.0',
      '0.5',
      '2.0',
      '-1.5',
      '0.0',
      '0.0',
      '-0.5',
      '0.5',
    ])
  )
  const cpStart = variable('int', namer.variable('cpStart'), cast(controlPointStartIndex, 'int'))

  const axisBernsteinVector = (
    axis: 'x' | 'y',
    t: DataNode<'vec2'>,
    identityMatrix: DataNode<'mat4'>
  ) =>
    variable(
      'vec4',
      namer.variable(`bern_${axis}`),
      multiply(
        literal('vec4', [
          '1.0',
          swizzle(t, axis),
          pow(swizzle(t, axis), literal('float', ['2.0'])),
          pow(swizzle(t, axis), literal('float', ['3.0'])),
        ]),
        identityMatrix
      )
    )

  const bernX = axisBernsteinVector('x', t, identityMatrix)
  const bernY = axisBernsteinVector('y', t, identityMatrix)

  const axisControlPointPositions = (axis: 'x' | 'y') =>
    variable('mat4', namer.variable(`control_point_positions_${axis}`), [
      swizzle(accessArray(controlPointInitialPositions, cpStart), axis),
      swizzle(accessArray(controlPointInitialPositions, add(cpStart, literal('int', ['1']))), axis),
      swizzle(accessArray(controlPointInitialPositions, add(cpStart, literal('int', ['2']))), axis),
      swizzle(accessArray(controlPointInitialPositions, add(cpStart, literal('int', ['3']))), axis),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x + 1}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x + 2}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x + 3}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 1}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 2}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 3}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 1}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 2}`]))
        ),
        axis
      ),
      swizzle(
        accessArray(
          controlPointInitialPositions,
          add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 3}`]))
        ),
        axis
      ),
    ])

  const aUv = attribute('vec2', builtinAttributeNames.uv)
  const vUv = varying('vec2', builtinVaryingNames.uv, aUv)

  const time = uniform('float', builtinUniformNames.time)

  const emitter = mitt() as BehaviorSetupEmitter

  const { behaviorAttributes, behaviorUniforms, modifiers } = computeBehavior(
    {
      off: emitter.off,
      on: emitter.on,
      namer,
      geometry,
      globalAttributes: {
        controlPointStartIndex,
        t,
        uv: aUv,
      },
      globalUniforms: {
        time,
        controlPointInitialPositions,
      },
      globalVaryings: {
        uv: vUv,
      },
    },
    behaviors
  )

  const controlPointPositions = modifiers.controlPointPositions.reduce(
    (controlPointPositions, modifier) => modifier(controlPointPositions),
    { x: axisControlPointPositions('x'), y: axisControlPointPositions('y') }
  )

  const axisIntermediatePositionVector = (
    axis: 'x' | 'y',
    positions: DataNode<'mat4'>,
    bernstein: DataNode<'vec4'>
  ) =>
    variable('vec4', namer.variable(`inter_p_${axis}`), [
      dot(bernstein, access(positions, '[0]')),
      dot(bernstein, access(positions, '[1]')),
      dot(bernstein, access(positions, '[2]')),
      dot(bernstein, access(positions, '[3]')),
    ])

  const interPX = axisIntermediatePositionVector('x', controlPointPositions.x, bernX)
  const interPY = axisIntermediatePositionVector('y', controlPointPositions.y, bernX)

  const position = modifiers.position.reduce(
    (position, modifier) => modifier(position),
    literal('vec3', [dot(bernY, interPX), dot(bernY, interPY), '0.0'])
  )
  const color = modifiers.color.reduce(
    (color, modifier) => modifier(color),
    literal('vec4', ['1.0'])
  )

  const { vertexShader, fragmentShader } = createProgram({
    gl_FragColor: output('gl_FragColor', color),
    gl_Position: output('gl_Position', literal('vec4', [position, '1.0'])),
  })

  return {
    vertexShader,
    fragmentShader,
    builtinAttributeNames,
    builtinUniformNames,
    behaviorAttributes,
    behaviorUniforms,
  }
}
