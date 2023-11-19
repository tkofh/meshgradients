import { uvFill, randomOffset } from '@meshgradients/behavior'
import { createTicker } from 'tickloop'
import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const { render } = createMeshGradient(
      {
        subdivisions: 50,
        points: { x: 5, y: 4 },
        behaviors: [
          uvFill({ constant: 0.5, format: 'ur/vb' }),
          randomOffset({
            axis: 'x',
            amplitude: { min: 0.2, max: 0.5 },
            frequency: { min: 0.2, max: 0.9 },
          }),
          randomOffset({
            axis: 'y',
            amplitude: { min: 0.1, max: 0.5 },
            frequency: { min: 0.2, max: 1.5 },
          }),
        ],
      },
      document.querySelector<HTMLCanvasElement>('#canvas'),
      true
    )

    createTicker().add((time) => {
      render(time)
    })
  },
  { capture: false }
)
