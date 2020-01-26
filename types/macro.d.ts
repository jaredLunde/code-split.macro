declare module 'code-split.macro' {
  function codeSplit<T = any>(path: string, isServerBuild: false): Promise<T>
  function codeSplit<T = any>(path: string, isServerBuild: true): T
  function codeSplit<T = any>(
    path: string,
    isServerBuild: boolean
  ): Promise<T> | T
  export default codeSplit
}
