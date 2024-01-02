module.exports = {
  // Enable Live Reload feature.
  files: ["./**/*.{md,mdx}", "./src/**/*.{js,jsx,ts,tsx}"],
  server: {
    baseDir: "./build",
  },
  // port and host being accessed.
  port: 3000,
  host: "0.0.0.0",
  // Close external access.
  open: true,
};
