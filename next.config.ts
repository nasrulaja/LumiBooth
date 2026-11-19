import path from "node:path";
import type { NextConfig } from "next";

/**
 * Build statis untuk GitHub Pages.
 * Diaktifkan lewat env GITHUB_PAGES=1 supaya `npm run dev` / deploy Vercel
 * tetap memakai server Next biasa.
 */
const isPages = process.env.GITHUB_PAGES === "1";
/** Nama repo → base path Pages: https://<user>.github.io/<repo>/ */
const repoName = "LumiBooth";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        images: { unoptimized: true },
        // Pages tidak mendukung trailing slash redirect; aset jadi folder/index.html
        trailingSlash: true,
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    // Root eksplisit agar Next tidak menebak dari package-lock.json di folder
    // induk (C:\Users\user) dan mengeluarkan warning.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

