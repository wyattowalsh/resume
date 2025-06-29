import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'
import Head from './+Head'
import Layout from './Layout'

// Default config (can be overridden by pages)
export default {
  extends: [vikeReact],
  Layout,
  Head,
  title: 'Wyatt Walsh | Resume',
  htmlAttributes: {
    suppressHydrationWarning: true,
  }
} satisfies Config 