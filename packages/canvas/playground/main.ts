import { randomColors } from '@meshgradients/core'
import { createMeshGradient } from '../src'

window.addEventListener(
  'load',
  () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
    createMeshGradient({ subdivisions: 1, points: 4, behaviors: [randomColors] }, canvas)
  },
  { capture: false }
)
