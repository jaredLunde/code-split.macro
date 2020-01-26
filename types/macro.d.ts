declare module 'code-split.macro' {
  function codeSplit(path: string, isServerBuild: false): Promise<any>
  function codeSplit(path: string, isServerBuild: true): any
  function codeSplit(path: string, isServerBuild: boolean): Promise<any> | any
  export default codeSplit
}
