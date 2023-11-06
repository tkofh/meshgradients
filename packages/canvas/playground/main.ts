import { uvFill, randomOffset } from '@meshgradients/behavior'
import { createTicker } from 'tickloop'
import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const start = performance.now()
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    const ticker = createTicker()
    ticker.start()

    const { render } = createMeshGradient(
      {
        subdivisions: 50,
        points: 5,
        behaviors: [
          uvFill({
            constant: 0.55,
            format: 'ur/vb',
          }),
          randomOffset({
            axis: 'x',
          }),
        ],
      },
      canvas
    )

    ticker.add((time) => {
      render(time)
    })

    console.log(performance.now() - start)
  },
  { capture: false }
)
