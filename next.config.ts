import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * The result page renders the rank card into its Open Graph image, which
   * means reading the card art off disk at request time. On a serverless
   * deploy `public/` is uploaded to the CDN and is not otherwise part of the
   * function's filesystem, so the art has to be traced in by hand or the
   * unfurled preview falls back to the plain title card in production while
   * looking perfect locally.
   */
  outputFileTracingIncludes: {
    "/r/[code]": ["./public/rankCards/**", "./public/fonts/**"],
  },
}

export default nextConfig
