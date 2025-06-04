
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // For client-side bundle, provide a fallback for 'react-native-fs'.
    // jsmediatags attempts to require it, which causes issues in web environments
    // as 'react-native-fs' is not available or needed for browser-based file reading.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Ensure fallback object exists
        'react-native-fs': false, // Tell Webpack to treat 'react-native-fs' as an empty module on the client
      };
    }
    return config;
  },
};

export default nextConfig;
