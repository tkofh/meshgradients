import type { Vector2, MeshGradientGeometry } from '../types'

export const createGeometry = (points: Vector2, subdivisions: Vector2): MeshGradientGeometry => {
  const controlPointPositions: number[] = []

  const pointTValues: number[] = []
  const pointControlPointStartIndices: number[] = []

  const triangles: number[] = []

  const cpSpacing: Vector2 = { x: 2 / (points.x - 1), y: 2 / (points.y - 1) }
  const tScalar: Vector2 = {
    x: 1 / (subdivisions.x + 1), // +1 rather than +2 because the denominator should include the final point
    y: 1 / (subdivisions.y + 1),
  }
  const controlPointCount: Vector2 = {
    x: points.x + 2,
    y: points.y + 2,
  }
  const pointCount: Vector2 = {
    x: points.x + subdivisions.x * (points.x - 1),
    y: points.y + subdivisions.y * (points.y - 1),
  }

  for (let y = -1; y <= points.y; y++) {
    for (let x = -1; x <= points.x; x++) {
      controlPointPositions.push(x * cpSpacing.x - 1, y * cpSpacing.y - 1)
    }
  }

  for (let y = 0; y < pointCount.y; y++) {
    for (let x = 0; x < pointCount.x; x++) {
      const isRightEdge = x === pointCount.x - 1
      const isTopEdge = y === pointCount.y - 1

      pointTValues.push(
        isRightEdge ? 1 : (x % (1 + subdivisions.x)) * tScalar.x,
        isTopEdge ? 1 : (y % (1 + subdivisions.y)) * tScalar.y
      )

      const cpX = Math.floor(x * tScalar.x) - (isRightEdge ? 1 : 0)
      const cpY = Math.floor(y * tScalar.y) - (isTopEdge ? 1 : 0)

      pointControlPointStartIndices.push(cpY * controlPointCount.x + cpX)

      if (x >= 1 && y >= 1) {
        const tr = y * pointCount.x + x
        const tl = y * pointCount.x + x - 1
        const br = (y - 1) * pointCount.x + x
        const bl = (y - 1) * pointCount.x + x - 1
        triangles.push(bl, br, tr, bl, tr, tl)
      }
    }
  }

  return {
    controlPointCount,
    pointCount,

    controlPointPositions: new Float32Array(controlPointPositions),
    pointTValues: new Float32Array(pointTValues),
    pointControlPointStartIndices: new Float32Array(pointControlPointStartIndices),

    triangles: new Uint16Array(triangles),
  }
}
