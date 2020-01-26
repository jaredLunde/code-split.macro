import path from 'path'
import {createMacro} from 'babel-plugin-macros'

export default createMacro(evaluateMacros)

// cycles through each call to the macro and determines an output for each
function evaluateMacros({references, state, babel}) {
  references.default.forEach(referencePath =>
    provideInterop({
      state,
      babel,
      referencePath,
    })
  )
}

// if Broker is defined in the scope then it will use that Broker, otherwise
// it requires the module.
function provideInterop({state, babel, referencePath}) {
  const {
    file: {
      opts: {filename},
    },
  } = state
  const {types: t} = babel

  const args = referencePath.parentPath.get('arguments')
  const isServerBuild = args[1].node.value
  const sourcePath = args[0].node.value
  // if the package source isn't relative it is interpreted as-is,
  // otherwise it is joined to the path of the filename being parsed by
  // Babel
  const source =
    sourcePath.match(relativePkg) === null
      ? sourcePath
      : path.join(path.dirname(filename), sourcePath)

  if (isServerBuild) {
    const serverTemplate = babel.template.smart(`() => require("PATH");`)
    referencePath.parentPath.replaceWith(serverTemplate({PATH: source}))
  } else {
    const chunkName = chunkNameCache.get(source)
    // duplicate imports are not allowed
    // creates a function that returns the import promise
    // SEE: https://babeljs.io/docs/en/babel-types#callexpression
    const promise = t.arrowFunctionExpression(
      [],
      t.callExpression(t.identifier('import'), [t.stringLiteral(source)])
    )
    // this adds webpack magic comment for chunks names
    //     .get('body') is the import() call expression
    //     .get('arguments')[0] is the first argument of the import(), which is the source
    referencePath.parentPath.replaceWith(promise)
    referencePath.parentPath
      .get('body')
      .get('arguments')[0]
      .addComment('leading', ` webpackChunkName: "${chunkName}" `)
  }
}

// relative packages are considered as such when they start with a period '.'
const relativePkg = /^\./g

// shortens the chunk name to its parent directory basename and its basename
function getShortChunkName(source) {
  if (source.match(relativePkg) || path.isAbsolute(source)) {
    return (
      path
        .dirname(source)
        .split(path.sep)
        .slice(-2)
        .join('/') +
      '/' +
      path.basename(source)
    )
  } else {
    return source
  }
}
// This is the chunk name cache which maps sources to their respective
// chunk names. This is necessary because you could import the same module
// from different paths, but you obviously want to use the same chunk rather
// than create two separate chunks in Webpack.
class ChunkNameCache {
  chunks = {}
  chunkNames = new Set()

  get(source) {
    if (this.chunks[source]) {
      return this.chunks[source]
    }

    let name = getShortChunkName(source)
    const originalName = name
    let i = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.chunkNames.has(name)) {
        // if this chunk name is already in use by a different source then we
        // append a unique ID to it
        name = `${originalName}.${i}`
        i++
      } else {
        break
      }
    }

    this.chunkNames.add(name)
    this.chunks[source] = name

    return name
  }
}

const chunkNameCache = new ChunkNameCache()
