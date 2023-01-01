module.exports = {
  ...require('@tkofh/prettier-config'),
  plugins: ['prettier-plugin-glsl'],
  overrides: [{ files: ['*.frag'], options: { parser: 'glsl-parser' } }],
}
