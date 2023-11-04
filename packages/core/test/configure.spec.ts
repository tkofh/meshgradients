import { describe, test } from 'vitest'
import { configureMeshGradient } from '../src'

describe('configure', () => {
  test('it works', () => {
    console.log(
      configureMeshGradient({
        points: 3,
        subdivisions: 2,
      })
    )
  })
})
