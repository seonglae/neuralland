/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',  // Proxy all requests from /api/* 
        destination: 'http://niinaoa4nlced6d9fdvsaimcuk.ingress.a100.mon.obl.akash.pub:31734/api/:path*', // Replace with your server
      },
    ];
  },
};

export default nextConfig;
