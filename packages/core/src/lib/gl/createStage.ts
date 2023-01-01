import { debounce } from 'perfect-debounce'
import type {
  Stage,
  StageAttribute,
  StageAttributeInfo,
  StageAttributes,
  StageConfig,
  StageUniform,
  StageUniforms,
} from './types'
import { stageAttributeTypeToGLConst, stageUniformTypeToGLMethod } from './constants'

export const createStage = <TAttributes extends StageAttributes, TUniforms extends StageUniforms>(
  config: StageConfig<TAttributes, TUniforms>
): Stage<TAttributes, TUniforms> | Error => {
  const canvas = config.canvas ?? document.createElement('canvas')

  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')

  let vertexShader: WebGLShader | null = null
  let fragmentShader: WebGLShader | null = null
  let program: WebGLProgram | null = null
  let resizeObserver: ResizeObserver | null

  const attributes = new Map<keyof TAttributes, StageAttribute>(Object.entries(config.attributes))
  const attributeInfo = new Map<keyof TAttributes, StageAttributeInfo>()
  const uniforms = new Map<keyof TUniforms, StageUniform>(Object.entries(config.uniforms))
  const uniformLocations = new Map<keyof TUniforms, WebGLUniformLocation>()

  const dispose = () => {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    gl.deleteProgram(program)

    for (const { buffer } of attributeInfo.values()) {
      gl.deleteBuffer(buffer)
    }
    attributeInfo.clear()

    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }

  vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, config.vertexShader)
  gl.compileShader(vertexShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const error = new Error(
      `Failed to create Stage: failed to compile Vertex Shader. Details:\n${gl.getShaderInfoLog(
        vertexShader
      )}`
    )
    dispose()

    return error
  }

  fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, config.fragmentShader)
  gl.compileShader(fragmentShader)
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const error = new Error(
      `Failed to create Stage: failed to compile Fragment Shader. Details:\n${gl.getShaderInfoLog(
        fragmentShader
      )}`
    )
    dispose()

    return error
  }

  program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = new Error(
      `Failed to create Stage: failed to link Shader Program. Details:\n${gl.getProgramInfoLog(
        program
      )}`
    )
    dispose()

    return error
  }

  gl.useProgram(program)

  for (const [attributeName, attributeConfig] of attributes.entries()) {
    const attributeBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, attributeConfig.data, gl[attributeConfig.usage])

    const attributeLocation = gl.getAttribLocation(program, attributeName as string)
    // if (attributeLocation === -1) {
    //   dispose()
    //   return new Error(
    //     `Failed to create Stage: failed to locate attribute ${attributeName as string}`
    //   )
    // }
    attributeInfo.set(attributeName, { buffer: attributeBuffer, location: attributeLocation })

    if (attributeLocation !== -1) {
      gl.enableVertexAttribArray(attributeLocation)
    }
  }

  for (const [uniformName, uniformConfig] of uniforms.entries()) {
    const uniformLocation = gl.getUniformLocation(program, uniformName as string)
    // if (uniformLocation === null) {
    //   dispose()
    //   return new Error(`Failed to create Stage: failed to locate uniform ${uniformName as string}`)
    // }

    uniformLocations.set(uniformName, uniformLocation)

    if (
      uniformConfig.type === 'mat2' ||
      uniformConfig.type === 'mat3' ||
      uniformConfig.type === 'mat4'
    ) {
      gl[stageUniformTypeToGLMethod[uniformConfig.type]](uniformLocation, false, uniformConfig.data)
    } else {
      gl[stageUniformTypeToGLMethod[uniformConfig.type]](
        uniformLocation,
        uniformConfig.data as number[]
      )
    }
  }

  const elements = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, config.elements.data, gl.STATIC_DRAW)

  const setAttribute = <TAttribute extends keyof TAttributes>(
    attribute: TAttribute,
    data: TAttributes[TAttribute]['data']
  ) => {
    const { buffer } = attributeInfo.get(attribute)

    config.attributes[attribute].data = data

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl[config.attributes[attribute].usage])
  }

  const setUniform = <TUniform extends keyof TUniforms>(
    uniform: TUniform,
    data: TUniforms[TUniform]['data']
  ) => {
    const location = uniformLocations.get(uniform)
    const uniformConfig = uniforms.get(uniform)

    config.uniforms[uniform].data = data

    if (
      uniformConfig.type === 'mat2' ||
      uniformConfig.type === 'mat3' ||
      uniformConfig.type === 'mat4'
    ) {
      gl[stageUniformTypeToGLMethod[uniformConfig.type]](location, false, uniformConfig.data)
    } else {
      gl[stageUniformTypeToGLMethod[uniformConfig.type]](location, uniformConfig.data as number[])
    }
  }

  const resize = (width: number, height: number) => {
    canvas.width = width
    canvas.height = height

    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  if (config.observeResize) {
    const debouncedResize = debounce(resize, 32, { leading: true })
    resizeObserver = new ResizeObserver(([entry]) => {
      debouncedResize(entry.contentRect.width, entry.contentRect.height)
    })
    resizeObserver.observe(canvas)
  }

  const rect = canvas.getBoundingClientRect()
  resize(rect.width, rect.height)

  const render = () => {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (const [attributeName, attributeConfig] of attributes.entries()) {
      const { buffer, location } = attributeInfo.get(attributeName)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.vertexAttribPointer(
        location,
        attributeConfig.size,
        gl[stageAttributeTypeToGLConst[attributeConfig.type]],
        false,
        0,
        0
      )
    }

    gl.drawElements(
      gl[config.elements.mode],
      config.elements.data.length,
      gl[config.elements.type],
      0
    )
  }

  return {
    canvas,
    attributes: config.attributes,
    uniforms: config.uniforms,
    elements: config.elements,
    vertexShader: config.vertexShader,
    fragmentShader: config.fragmentShader,

    resize,
    setAttribute,
    setUniform,
    render,
    dispose,
  }
}
