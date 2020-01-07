import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const { NODE_ENV } = process.env

export default {
  input: 'dist/lib/index.js',
  output: {
    name: 'YG',
    file: './dist/yu_gong.js',
    format: 'umd',
    exports: 'named',
    sourcemap: true
  },
  plugins: [
    commonjs(),
    NODE_ENV === 'production' && terser()
  ]
}
