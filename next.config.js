/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App-layer baseline headers. Cloudflare Access (Project 4) is the
  // actual perimeter control — these headers are defense in depth, not
  // a substitute for it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.accounts.dev; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
