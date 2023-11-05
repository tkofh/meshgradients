import { randomColors } from '@meshgradients/behavior'
import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const start = performance.now()
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient(
      {
        subdivisions: 20,
        points: 4,
        behaviors: [
          randomColors({
            hue: { min: 0, max: 60 },
            saturation: { min: 70, max: 80 },
            lightness: { min: 50, max: 60 },
            alpha: { min: 0.2, max: 0.8 },
          }),
        ],
      },
      canvas
    )

    console.log(performance.now() - start)
  },
  { capture: false }
)
