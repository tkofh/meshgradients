import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient(canvas, { subdivisions: 18, points: 8 })
  },
  { capture: false }
)
