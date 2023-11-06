import { randomColors, uvFill } from '@meshgradients/behavior'
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
          randomColors({
            hue: { min: 0, max: 360 },
            saturation: { min: 70, max: 100 },
            lightness: { min: 50, max: 80 },
            alpha: { min: 0, max: 0.05 },
          }),
        ],
      },
      canvas
    )

    console.log(performance.now() - start)
  },
  { capture: false }
)
