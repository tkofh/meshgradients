import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  treeshake: true,
  loader: {
    '.vert': 'text',
    '.frag': 'text',
  },
})
