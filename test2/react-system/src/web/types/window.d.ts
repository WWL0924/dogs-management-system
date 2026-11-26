
declare global {
  interface window {
    _REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof import('redux').compose;
  }
}

export { }
