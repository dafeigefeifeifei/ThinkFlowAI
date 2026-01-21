import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: localStorage.getItem('language') || 'zh', // 默认英文
  fallbackLocale: 'zh',
  messages: {
    en,
    zh
  }
})

export default i18n
