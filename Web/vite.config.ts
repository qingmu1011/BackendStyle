import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import svgLoader from "vite-svg-loader";

const pathSrc = path.resolve(__dirname, 'src');
import * as $config from "./public/platform-config.json";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: $config.VITE_PROXY_SERVER_PORT,
    open: true,
    proxy: {
      //设置代理(本地开发)
      [$config.VITE_PROXY_SERVER_API_PREFIX]: {
        target: $config.VITE_PROXY_SERVER_TARGET,
        changeOrigin: true,
        secure: false, // 如果是https接口，需要配置这个参数
        rewrite: (path) => path.replace(new RegExp(`^${$config.VITE_PROXY_SERVER_API_PREFIX}`), '')
      },
    }
  },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
      '@/': `${pathSrc}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;@use "~/styles/common.scss" as *;`,
      },
    },
  },
  plugins: [
    vue(),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: 'src/components.d.ts',
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true,
        }),
      ],
      transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
      ]
    }),
    svgLoader(),
    // 需要使用mock数据时开启
    // vitePluginFakeServer({
    //   logger: false,
    //   include: "mock",
    //   infixName: false,
    //   enableProd: true
    // }),
  ],
})
