import type { MeshGradientOptions, ResolvedMeshGradientOptions } from '../types'

/**
 * Returns a config object based on the user's input options and the library defaults
 * @param options
 */
export const resolveOptions = (
  options: MeshGradientOptions
):
  | { success: true; options: ResolvedMeshGradientOptions }
  | { success: false; messages: string[] } => {
  const messages: string[] = []
  if (typeof options.subdivisions === 'number') {
    if (options.subdivisions < 0) {
      messages.push('Mesh Gradient `options.subdivisions` must be greater than or equal to 0')
    }
  } else if (options.subdivisions.x < 0) {
    messages.push('Mesh Gradient `options.subdivisions.x` must be greater than or equal to 0')
  } else if (options.subdivisions.y < 0) {
    messages.push('Mesh Gradient `options.subdivisions.x` must be greater than or equal to 0')
  }

  if (typeof options.points === 'number') {
    if (options.points < 2) {
      messages.push('Mesh Gradient `options.points` must be greater than or equal to 2')
    }
  } else if (options.points.x < 2) {
    messages.push('Mesh Gradient `options.points.x` must be greater than or equal to 2')
  } else if (options.points.y < 2) {
    messages.push('Mesh Gradient `options.points.y` must be greater than or equal to 2')
  }

  if (messages.length > 0) {
    return {
      success: false,
      messages,
    }
  } else {
    const subdivisions = {
      x: typeof options.subdivisions === 'number' ? options.subdivisions : options.subdivisions.x,
      y: typeof options.subdivisions === 'number' ? options.subdivisions : options.subdivisions.y,
    }
    const points = {
      x: typeof options.points === 'number' ? options.points : options.points.x,
      y: typeof options.points === 'number' ? options.points : options.points.y,
    }
    return {
      success: true,
      options: {
        subdivisions,
        points,
        behaviors: options.behaviors ?? [],
      },
    }
  }
}
