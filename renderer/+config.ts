import { rootTitle } from '@/lib/site'
import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'
import Layout from './Layout'

// Default config (can be overridden by pages)
export default {
  extends: [vikeReact],
  Layout,
  title: rootTitle,
  htmlAttributes: {
    suppressHydrationWarning: true,
  }
} satisfies Config
