<hr>
<div align="center">
  <h1 align="center">
    code-split.macro
  </h1>
</div>

<p align="center">
  <a aria-label="Types" href="https://www.npmjs.com/package/code-split.macro">
    <img alt="Types" src="https://img.shields.io/npm/types/code-split.macro?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/jaredLunde/code-split.macro">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/jaredLunde/code-split.macro?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.com/jaredLunde/code-split.macro">
    <img alt="Build status" src="https://img.shields.io/travis/com/jaredLunde/code-split.macro?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/code-split.macro">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/code-split.macro?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/code-split.macro?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i code-split.macro</pre>
<hr>

A macro for assisting in client/server interop for code splitting so server side imports are not asynchronous

## The Problem

We want our routes and other heavy components to be code split on the client side
to reduce the size of our bundle, but we encounter issues when trying to render on
the server because packages like `react` and `preact` don't handle promises
when rendering apps to strings. Ideally, we would only include those asynchronous
imports when building our client code and use regular `require()` statements
when prerendering our app.

This macro solves the `import`/`require` interop part of that problem.

## Requirements

- [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros) (this ships with `CRA`, `preact-cli`, and many others)

## Quick Start

```js
import codeSplit from 'code-split.macro'

// __SERVER__ below would suggest you're using something like
// webpack.DefinePlugin() to create a special __SERVER__ constant
// that is `true` when you're building the SSR part of your app
// and `false` when building the client part
export const Home = codeSplit('./Home', __SERVER__)

////////////////////////////////////////////////////////////////////////////////
//                               ⬇ BECOMES ⬇                                //
///////////////////////////////////////////////////////////////////////////////

export const Home = __SERVER__
  ? () => require('./Home')
  : () => import(/* webpackChunkName: "src/pages/Home" */ './Home')
```

## API

### `codeSplit(path: string, isServerBuild: boolean)`

| Argument      | Type      | Required? | Description                                                                      |
| ------------- | --------- | --------- | -------------------------------------------------------------------------------- |
| path          | `string`  | Yes       | The relative path to the file you're code splitting                              |
| isServerBuild | `boolean` | Yes       | Should be `true` if this is your SSR build, `false` if this is your client build |

## LICENSE

MIT
