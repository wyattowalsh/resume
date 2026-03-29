import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'
import Layout from './Layout'

// Default config (can be overridden by pages)
export default {
  extends: [vikeReact],
  Layout,
  title: "Wyatt Walsh | Resume",
  htmlAttributes: {
    suppressHydrationWarning: true,
  }
} satisfies Config
