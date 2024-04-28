/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { defineConfig, presetAttributify, presetIcons, presetUno, presetWind, presetWebFonts } from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      },
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then((i) => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
        eos: () => import('@iconify-json/eos-icons/icons.json').then((i) => i.default),
        'icon-park-solid': () => import('@iconify-json/icon-park-solid/icons.json').then((i) => i.default),
        'icon-park-outline': () => import('@iconify-json/icon-park-outline/icons.json').then((i) => i.default)
      }
    }),
    presetWind({
      theme: {
        '3xl': '0 3px 8px 6px rgba(7,17,27,0.05)'
      }
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto'
      }
    }),
    presetUno()
  ],
  shortcuts: []
});
