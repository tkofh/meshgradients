export const createPlaneGeometry = (grid: number | [number, number]) => {
  const gridX = Array.isArray(grid) ? grid[0] : grid
  const gridY = Array.isArray(grid) ? grid[1] : grid
  const segmentX = 2 / (gridX - 1)
  const segmentY = 2 / (gridY - 1)

  const vertices: number[] = []
  const triangles: number[] = []
  const uvs: number[] = []

  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      vertices.push(x * segmentX - 1, y * segmentY - 1)
      uvs.push(x * segmentX * 0.5, y * segmentY * 0.5)
      if (x >= 1 && y >= 1) {
        const tr = y * gridX + x
        const tl = y * gridX + x - 1
        const br = (y - 1) * gridX + x
        const bl = (y - 1) * gridX + x - 1
        triangles.push(bl, br, tr, bl, tr, tl)
      }
    }
  }

  return { vertices, triangles, uvs }
}
