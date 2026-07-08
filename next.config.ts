import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "eventemitter3$": path.resolve(
        process.cwd(),
        "node_modules/eventemitter3/index.js"
      ),
      "redux$": path.resolve(
        process.cwd(),
        "node_modules/redux/dist/cjs/redux.cjs"
      ),
      "cmdk$": path.resolve(
        process.cwd(),
        "node_modules/cmdk/dist/index.js"
      ),
    }

    return config
  },
}

export default nextConfig