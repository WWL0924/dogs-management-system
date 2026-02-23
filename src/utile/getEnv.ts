

export function warppEnv(envConf: Recordable): ViteEnv {
  const ret: any = {}

  for (const envName of Object.keys(envConf)) {
    let realName: any = envConf[envName].replace(/\\n/g, '\n')

    realName = realName === 'true'
      ? true
      : realName === 'false'
        ? false
        : realName

    if (envName === 'VITE_PORT') {
      realName = Number(realName)
    }

    if (envName === 'VITE_PROXY') {
      try {
        realName = JSON.parse(realName)
      } catch (error) {
        console.log(error)
      }
    }

    ret[envName] = realName

    // 只允许写回 string
    process.env[envName] = String(realName)
  }

  return ret
}

