import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient(canvas, { subdivisions: 1, points: 14 })
  },
  { capture: false }
)
