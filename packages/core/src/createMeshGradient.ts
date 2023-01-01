import { createTicker } from 'tickloop'
import type { MeshGradientOptions, Vector2 } from './types'
import { resolveConfig } from './lib'
import canvasVertexSource from './shaders/meshgradient.vert?raw'
import canvasFragmentSource from './shaders/meshgradient.frag?raw'
import { createStage } from './lib/gl/createStage'

export const createMeshGradient = (canvas: HTMLCanvasElement, options: MeshGradientOptions) => {
  const result = resolveConfig(options)

  if (result.success === false) {
    throw new TypeError(`Failed to create Mesh Gradient:\n\n* ${result.messages.join(`\n* `)}`)
  }

  const config = result.config

  const controlPointPositions: number[] = []

  const pointTValues: number[] = []
  const pointControlPointStartIndices: number[] = []

  const triangles: number[] = []

  const cpSpacing: Vector2 = { x: 2 / (config.points.x - 1), y: 2 / (config.points.y - 1) }
  const tScalar: Vector2 = {
    x: 1 / (config.subdivisions.x + 1), // +1 rather than +2 because the denominator should include the final point
    y: 1 / (config.subdivisions.y + 1),
  }
  const cpCountX = config.points.x + 2
  const pointCount: Vector2 = {
    x: config.points.x + config.subdivisions.x * (config.points.x - 1),
    y: config.points.y + config.subdivisions.y * (config.points.y - 1),
  }

  for (let y = -1; y <= config.points.y; y++) {
    for (let x = -1; x <= config.points.x; x++) {
      controlPointPositions.push(x * cpSpacing.x - 1, y * cpSpacing.y - 1)
    }
  }

  for (let y = 0; y < pointCount.y; y++) {
    for (let x = 0; x < pointCount.x; x++) {
      const isRightEdge = x === pointCount.x - 1
      const isTopEdge = y === pointCount.y - 1

      pointTValues.push(
        isRightEdge ? 1 : (x % (1 + config.subdivisions.x)) * tScalar.x,
        isTopEdge ? 1 : (y % (1 + config.subdivisions.y)) * tScalar.y
      )

      const cpX = Math.floor(x * tScalar.x) - (isRightEdge ? 1 : 0)
      const cpY = Math.floor(y * tScalar.y) - (isTopEdge ? 1 : 0)

      pointControlPointStartIndices.push(cpY * cpCountX + cpX)

      if (x >= 1 && y >= 1) {
        const tr = y * pointCount.x + x
        const tl = y * pointCount.x + x - 1
        const br = (y - 1) * pointCount.x + x
        const bl = (y - 1) * pointCount.x + x - 1
        triangles.push(bl, br, tr, bl, tr, tl)
      }
    }
  }

  const a = 0.5

  const vertexSource = canvasVertexSource
    .replace(
      /uniform vec2 u_cp_pos\[0\]/,
      `uniform vec2 u_cp_pos[${String(controlPointPositions.length / 2)}]`
    )
    .replace(/const int ROWLEN = 0/, `const int ROWLEN = ${String(cpCountX)}`)
    .replace(
      /const mat4 IDENMAT = mat4\(1.0\)/,
      `const mat4 IDENMAT = mat4(${[
        0,
        -a,
        2 * a,
        -a,
        1,
        0,
        a - 3,
        2 - a,
        0,
        a,
        3 - 2 * a,
        a - 2,
        0,
        0,
        -a,
        a,
      ].join(', ')})`
    )

  // controlPointPositions[32] = -0.3
  // controlPointPositions[33] = -0.3

  const stage = createStage({
    canvas,
    attributes: {
      a_cp_start: {
        type: 'float',
        data: new Float32Array(pointControlPointStartIndices),
        size: 1,
        usage: 'STATIC_DRAW',
      },
      a_t: {
        type: 'float',
        data: new Float32Array(pointTValues),
        size: 2,
        usage: 'STATIC_DRAW',
      },
      a_color: {
        type: 'float',
        // data: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0]),
        data: new Float32Array(
          Array.from({ length: pointCount.x * pointCount.y * 3 }, () => Math.random())
        ),
        size: 3,
        usage: 'STATIC_DRAW',
      },
    },
    elements: {
      data: new Uint16Array(triangles),
      mode: 'TRIANGLES',
      type: 'UNSIGNED_SHORT',
    },
    uniforms: {
      u_cp_pos: {
        type: 'vec2',
        data: new Float32Array(controlPointPositions),
      },
    },
    vertexShader: vertexSource,
    fragmentShader: canvasFragmentSource,
    observeResize: true,
  })

  if (stage instanceof Error) {
    throw stage
  }

  stage.render()

  const ticker = createTicker()
  ticker.add(() => {
    // stage.setUniform('u_time', [time * 0.001])
    stage.render()
  })
}
