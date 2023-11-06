import { uvFill } from '@meshgradients/behavior'
import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const start = performance.now()
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient(
      {
        subdivisions: 10,
        points: 4,
        behaviors: [
          uvFill({
            constant: 0.5,
            format: 'ur/vb',
          }),
        ],
      },
      canvas
    )

    console.log(performance.now() - start)
  },
  { capture: false }
)
