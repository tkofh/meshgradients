export const stageAttributeTypeToGLConst = {
  float: 'FLOAT',
  int: 'INT',
} as const

export const stageUniformTypeToGLMethod = {
  float: 'uniform1fv',
  vec2: 'uniform2fv',
  vec3: 'uniform3fv',
  vec4: 'uniform4fv',
  mat2: 'uniformMatrix2fv',
  mat3: 'uniformMatrix3fv',
  mat4: 'uniformMatrix4fv',
  int: 'uniform1iv',
  ivec2: 'uniform2iv',
  ivec3: 'uniform3iv',
  ivec4: 'uniform4iv',
  sampler2D: 'uniform1iv',
  samplerCube: 'uniform1iv',
} as const
