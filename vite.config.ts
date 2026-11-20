import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Nitro's Vercel preset writes the Build Output API to `.vercel/output`.
  nitro: {
    preset: "vercel",
  },
  vite: {
    server: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
  },
});
