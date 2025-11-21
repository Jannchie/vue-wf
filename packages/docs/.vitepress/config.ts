import { defineConfig } from 'vitepress'

const enNav = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Layout & Sizing', link: '/guide/layout' },
  { text: 'Virtualization', link: '/guide/virtualization' },
]

const zhNav = [
  { text: '指南', link: '/zh/guide/getting-started' },
  { text: '布局与尺寸', link: '/zh/guide/layout' },
  { text: '虚拟化', link: '/zh/guide/virtualization' },
]

const enSidebar = {
  '/guide/': [
    { text: 'Getting Started', link: '/guide/getting-started' },
    { text: 'Layout & Sizing', link: '/guide/layout' },
    { text: 'Virtualization', link: '/guide/virtualization' },
  ],
}

const zhSidebar = {
  '/zh/guide/': [
    { text: '快速开始', link: '/zh/guide/getting-started' },
    { text: '布局与尺寸', link: '/zh/guide/layout' },
    { text: '虚拟化渲染', link: '/zh/guide/virtualization' },
  ],
}

export default defineConfig({
  title: 'Vue WF',
  description: 'Virtualized waterfall layout for Vue 3',
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      link: '/',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        socialLinks: [{ icon: 'github', link: 'https://github.com/jannchie/vue-wf' }],
        footer: {
          message: 'MIT Licensed',
          copyright: 'Copyright © 2024-present',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar,
        outline: { label: '页面导航' },
        socialLinks: [{ icon: 'github', link: 'https://github.com/jannchie/vue-wf' }],
        footer: {
          message: 'MIT 许可',
          copyright: '版权所有 2024-present',
        },
      },
    },
  },
})
