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
import type {
  // BehaviorSetupContext,
  // MeshGradientAttributes,
  // MeshGradientBehavior,
  MeshGradientGeometry,
  // MeshGradientUniforms,
} from '../../types'
import { IDENTITY_MATRIX } from './constants'

export const compileShaders = (
  geometry: MeshGradientGeometry
  // behaviors: Array<MeshGradientBehavior<MeshGradientUniforms, MeshGradientAttributes>>
) => {
  const namer = createNamer()

  const UNIFORM_NAMES = {
    CONTROL_POINT_POSITIONS: namer.uniform('controlPointPositions'),
  } as const
  const ATTRIBUTE_NAMES = {
    CONTROL_POINT_START_INDEX: namer.attribute('controlPointStartIndex'),
    T: namer.attribute('t'),
  } as const
  const CONSTANT_NAMES = {
    IDENTITY_MATRIX: namer.constant('IDENTITY_MATRIX'),
  } as const

  const controlPointPositions = uniformArray(
    'vec2',
    UNIFORM_NAMES.CONTROL_POINT_POSITIONS,
    geometry.controlPointCount.x * geometry.controlPointCount.y
  )

  const controlPointStartIndex = attribute('float', ATTRIBUTE_NAMES.CONTROL_POINT_START_INDEX)
  const t = attribute('vec2', ATTRIBUTE_NAMES.T)

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

  const position = literal('vec3', [dot(bernY, interPX), dot(bernY, interPY), '0.0'])
  const color = literal('vec4', ['1.0', '1.0', '1.0', '1.0'])

  // const context: BehaviorSetupContext<MeshGradientUniforms, MeshGradientAttributes> = {
  //   attributes: {},
  //   color,
  //   namer,
  //   position,
  //   uniforms: {},
  // }

  // for (const behavior of behaviors) {
  //   console.log(behavior)
  //   const result = behavior.setup(context)
  // }

  const { vertexShader, fragmentShader } = createProgram({
    gl_FragColor: output('gl_FragColor', color),
    gl_Position: output('gl_Position', literal('vec4', [swizzle(position, 'xyz'), '1.0'])),
  })

  return {
    vertexShader,
    fragmentShader,
    UNIFORM_NAMES,
    ATTRIBUTE_NAMES,
  }
}
