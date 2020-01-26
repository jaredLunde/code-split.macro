import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-plugin-macros'

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {filename: __filename},
  tests: [
    `
      import codeSplit from './macro'
      const Home = codeSplit('./macro', true)
    `,
    `
      import codeSplit from './macro'
      const Home = codeSplit('./macro', false)
    `,
    `
      import codeSplit from './macro'
      const Home = codeSplit('./macro', false)
      const OtherHome = codeSplit('./macro', false)
    `,
  ],
})
