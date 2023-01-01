export interface Vector2 {
  x: number
  y: number
}

export interface MeshGradientOptions {
  subdivisions: number | Vector2
  points: number | Vector2
  maxPixelRatio?: number
}

export interface MeshGradientConfig {
  maxPixelRatio: number
  subdivisions: Vector2
  points: Vector2
}
