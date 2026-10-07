export default defineNuxtConfig({
  compatibilityDate: '2026-10-05',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.AUTH_SECRET,
    public: {
      appName: 'میفین'
    }
  },
  nitro: {
    preset: 'vercel'
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: 'میفین | مدیریت مالی شخصی',
      short_name: 'میفین',
      description: 'اپلیکیشن مدیریت مالی شخصی برای حساب‌ها، تراکنش‌ها، انتقال‌ها و گزارش‌ها.',
      lang: 'fa',
      dir: 'rtl',
      start_url: '/dashboard',
      scope: '/',
      display: 'standalone',
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      orientation: 'portrait',
      background_color: '#f7f8fb',
      theme_color: '#0f172a',
      categories: ['finance', 'productivity'],
      icons: [
        { src: '/pwa-icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
        { src: '/pwa-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
      ],
      shortcuts: [
        { name: 'تراکنش جدید', short_name: 'تراکنش', url: '/transactions' },
        { name: 'حساب‌ها', short_name: 'حساب‌ها', url: '/accounts' },
        { name: 'گزارش‌ها', short_name: 'گزارش‌ها', url: '/reports' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: false
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'fa',
        dir: 'rtl'
      },
      title: 'میفین | مدیریت مالی شخصی',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'robots', content: 'noindex,nofollow' },
        { name: 'description', content: 'اپلیکیشن مدیریت مالی شخصی با داشبورد، تراکنش، حساب و گزارش.' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'میفین' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'icon', href: '/pwa-icon.svg' },
        { rel: 'apple-touch-icon', href: '/pwa-icon.svg' }
      ]
    }
  }
})
