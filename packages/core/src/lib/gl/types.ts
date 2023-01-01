export type GL = WebGL2RenderingContext | WebGLRenderingContext

export type StageUsage = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW'

export type StageElementMode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

export type StageElementType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT'

export interface StageElements {
  mode: StageElementMode
  data: Uint16Array
  type: StageElementType
}

export type StageAttribute = {
  usage: StageUsage
  size: number
} & (
  | {
      type: 'float'
      data: Float32Array | Float64Array
    }
  | {
      type: 'int'
      data: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array
    }
)

export type StageUniform =
  | {
      type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4'
      data: Float32List
    }
  | {
      type: 'int' | 'sampler2D' | 'samplerCube' | 'ivec2' | 'ivec3' | 'ivec4'
      data: Int32List
    }

export interface StageAttributes {
  [Attribute: string]: StageAttribute
}

export interface StageUniforms {
  [Uniform: string]: StageUniform
}

export interface StageConfig<TAttributes extends StageAttributes, TUniforms extends StageUniforms> {
  canvas?: HTMLCanvasElement
  vertexShader: string
  fragmentShader: string
  elements: StageElements
  attributes: TAttributes
  uniforms: TUniforms
  maxPixelRatio?: number
  observeResize?: boolean
}

export interface StageAttributeInfo {
  buffer: WebGLBuffer
  location: number
}

export interface Stage<TAttributes extends StageAttributes, TUniforms extends StageUniforms> {
  readonly canvas: HTMLCanvasElement
  readonly vertexShader: string
  readonly fragmentShader: string
  readonly elements: Readonly<StageElements>
  readonly attributes: Readonly<{
    [TAttribute in keyof TAttributes]: Readonly<TAttributes[TAttribute]>
  }>
  readonly uniforms: Readonly<{ [TUniform in keyof TUniforms]: Readonly<TUniforms[TUniform]> }>
  readonly setAttribute: <TAttribute extends keyof TAttributes>(
    attribute: TAttribute,
    data: TAttributes[TAttribute]['data']
  ) => void
  readonly setUniform: <TUniform extends keyof TUniforms>(
    uniform: TUniform,
    data: TUniforms[TUniform]['data']
  ) => void
  readonly render: () => void
  readonly resize: (width: number, height: number) => void
  readonly dispose: () => void
}
