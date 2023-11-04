import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient({ subdivisions: 0, points: 4 }, canvas)
  },
  { capture: false }
)
