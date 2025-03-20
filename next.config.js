/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // 添加 .glsl 文件的加载器
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });

    // 添加 fallback 解决 three-mesh-bvh 导入错误
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "three/src/geometries/BatchedMesh": false,
      "three/BatchedMesh": false,
    };

    return config;
  },
};

module.exports = nextConfig; 