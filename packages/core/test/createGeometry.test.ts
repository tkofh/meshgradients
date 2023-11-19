import { describe, test } from 'vitest'
import { createGeometry } from '../src/lib/createGeometry'

describe('createGeometry', () => {
  test('it assigns each point to the correct control points', ({ expect }) => {
    const geometry1 = createGeometry({ x: 2, y: 2 }, { x: 0, y: 0 })
    expect(geometry1.pointControlPointStartIndices).toHaveLength(4)
    expect(Array.from(geometry1.pointControlPointStartIndices)).toEqual([0, 0, 0, 0])

    const geometry2 = createGeometry({ x: 3, y: 3 }, { x: 0, y: 0 })
    expect(geometry2.pointControlPointStartIndices).toHaveLength(9)
    expect(Array.from(geometry2.pointControlPointStartIndices)).toEqual([0, 1, 1, 5, 6, 6, 5, 6, 6])
  })
})
