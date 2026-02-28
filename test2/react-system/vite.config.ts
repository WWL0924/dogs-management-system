import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { warppEnv } from './src/utile/getEnv'
import viteCompression from "vite-plugin-compression"

// https://vite.dev/config/
export default defineConfig((mode: ConfigEnv): UserConfig => {
  // 读取配置文件
  const env = loadEnv(mode.mode, process.cwd())//当前环境模式 当前工作目录
  const viteEnv = warppEnv(env)
  return {
    base: '/dogs-management-system/',
    plugins: [
      react(),
      //true的时候启用这个插件 打包时生成.gz压缩文件
      viteEnv.VITE_BUILD_COMPRESS && viteEnv.VITE_BUILD_COMPRESS !== 'none' && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
        filter: /\.(js|mjs|json|css|html)$/i,
      })


    ],
    // vite底层要求绝对路径
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    //启动的时候自动启动
    server: {
      host: '0.0.0.0',
      port: viteEnv.VITE_PORT,
      open: viteEnv.open || false,
      proxy: viteEnv.VITE_API_URL ? {
        '/api': {
          target: viteEnv.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined,
    },
    // //打包配置
    // build: {
    //   outDir: 'dist',   // 打包输出目录
    //   //打包方式 esbuild快 不能去除打包时的console.log  terser可以去除
    //   minify: 'terser',
    //   terserOptions: {
    //     compress: {
    //       drop_console: viteEnv.VITE_DROP_CONSOLE,
    //       drop_debugger: true,
    //     }

    //   }
    // }

  }
})
