const nextConfig = {
  turbopack: {
    rules: {
      'node_modules/@mapbox/node-pre-gyp/**.html': ['raw-loader'],
      '**/*.html': ['raw-loader'],
    },
  },
};

export default nextConfig;
