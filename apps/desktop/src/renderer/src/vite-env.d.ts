/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const url: string
  export default url
}

declare module 'sql.js/dist/sql-wasm.js?url' {
  const url: string
  export default url
}
