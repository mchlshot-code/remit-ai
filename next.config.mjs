import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/api\/rates/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-rates",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 10 * 60, // 10 minutes
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\/api\/chat/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-chat",
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: /\/icons\/.*\.png$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pwa-icons",
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 365 Days
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/alerts"),
      handler: "NetworkOnly",
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
