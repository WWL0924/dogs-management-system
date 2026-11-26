type ViteEnv = {
  VITE_PORT: number
  VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
  VITE_API_URL?: string
  open?: boolean
}

export function warppEnv(envConf: Record<string, string>): ViteEnv {
  const ret: Record<string, unknown> = {}

  for (const envName of Object.keys(envConf)) {
    let realName: unknown = envConf[envName].replace(/\\n/g, '\n')

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
        realName = JSON.parse(String(realName))
      } catch (error) {
        console.log(error)
      }
    }

    ret[envName] = realName

    // 只允许写回 string
    process.env[envName] = String(realName)
  }

    return ret as unknown as ViteEnv
}

