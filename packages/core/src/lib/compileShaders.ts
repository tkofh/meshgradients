import type { DataNode } from '@webgl-tools/glsl-nodes'
import {
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
} from '@webgl-tools/glsl-nodes'
import mitt from 'mitt'
import type { BehaviorSetup, BehaviorSetupContext, BehaviorSetupEmitter } from '../types/behavior'
import type {
  MeshGradientAttributes,
  MeshGradientGeometry,
  MeshGradientUniforms,
} from '../types/mesh'

const IDENTITY_MATRIX = [
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
]

export const compileShaders = (geometry: MeshGradientGeometry, behaviors: BehaviorSetup[]) => {
  const namer = createNamer()

  const builtinUniformNames = {
    controlPointPositions: namer.uniform('controlPointPositions'),
  } as const
  const builtinAttributeNames = {
    controlPointStartIndex: namer.attribute('controlPointStartIndex'),
    t: namer.attribute('t'),
  } as const
  const CONSTANT_NAMES = {
    IDENTITY_MATRIX: namer.constant('IDENTITY_MATRIX'),
  } as const

  const controlPointPositions = uniformArray(
    'vec2',
    builtinUniformNames.controlPointPositions,
    geometry.controlPointCount.x * geometry.controlPointCount.y
  )

  const controlPointStartIndex = attribute('float', builtinAttributeNames.controlPointStartIndex)
  const t = attribute('vec2', builtinAttributeNames.t)

  const identityMatrix = constant(
    'mat4',
    CONSTANT_NAMES.IDENTITY_MATRIX,
    literal('mat4', IDENTITY_MATRIX)
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

  const axisIntermediatePositionVector = (axis: 'x' | 'y', bernstein: DataNode<'vec4'>) =>
    variable('vec4', namer.variable(`inter_p_${axis}`), [
      dot(
        bernstein,
        literal('vec4', [
          swizzle(accessArray(controlPointPositions, cpStart), axis),
          swizzle(accessArray(controlPointPositions, add(cpStart, literal('int', ['1']))), axis),
          swizzle(accessArray(controlPointPositions, add(cpStart, literal('int', ['2']))), axis),
          swizzle(accessArray(controlPointPositions, add(cpStart, literal('int', ['3']))), axis),
        ])
      ),
      dot(
        bernstein,
        literal('vec4', [
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x + 1}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x + 2}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x + 3}`]))
            ),
            axis
          ),
        ])
      ),
      dot(
        bernstein,
        literal('vec4', [
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 1}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 2}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 2 + 3}`]))
            ),
            axis
          ),
        ])
      ),
      dot(
        bernstein,
        literal('vec4', [
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 1}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 2}`]))
            ),
            axis
          ),
          swizzle(
            accessArray(
              controlPointPositions,
              add(cpStart, literal('int', [`${geometry.controlPointCount.x * 3 + 3}`]))
            ),
            axis
          ),
        ])
      ),
    ])

  const interPX = axisIntermediatePositionVector('x', bernX)
  const interPY = axisIntermediatePositionVector('y', bernX)

  const emitter = mitt() as BehaviorSetupEmitter

  let behaviorAttributes: MeshGradientAttributes = {}
  let behaviorUniforms: MeshGradientUniforms = {}

  let context: BehaviorSetupContext = {
    off: emitter.off,
    on: emitter.on,
    namer,
    color: literal('vec4', ['1.0', '1.0', '1.0', '1.0']),
    position: literal('vec3', [dot(bernY, interPX), dot(bernY, interPY), '0.0']),
    geometry,
    globalAttributes: {
      controlPointStartIndex,
      t,
    },
    globalUniforms: {
      controlPointPositions,
    },
  }

  for (const behavior of behaviors) {
    const result = behavior(context)

    context = {
      ...context,
      color: result.color,
      position: result.position,
    }
    behaviorAttributes = { ...behaviorAttributes, ...result.attributes }
    behaviorUniforms = { ...behaviorUniforms, ...result.uniforms }
  }

  const { vertexShader, fragmentShader } = createProgram({
    gl_FragColor: output('gl_FragColor', context.color),
    gl_Position: output('gl_Position', literal('vec4', [context.position, '1.0'])),
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
