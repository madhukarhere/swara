/** @type {import('next').NextConfig} */
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  // We use plain <img> for locally-served media; don't fail builds on lint.
  eslint: { ignoreDuringBuilds: true },
  // Proxy API + media to the Express backend so the browser stays same-origin
  // (no CORS, cookies just work, audio range requests pass through).
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiTarget}/api/:path*` },
      { source: '/media/:path*', destination: `${apiTarget}/media/:path*` },
    ];
  },
};

export default nextConfig;
