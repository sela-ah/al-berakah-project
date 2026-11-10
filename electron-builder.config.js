// Build settings for the Windows installer.
// In GitHub Actions the repository name is read automatically, so updates can be published to Releases.
const repo = (process.env.GITHUB_REPOSITORY || "").split("/");

module.exports = {
  appId: "com.alberakah.reminders",
  productName: "Al Berakah Reminders",
  files: ["main.js", "preload.js", "index.html", "supabase.js", "config.js", "icon.png"],
  win: { target: "nsis", icon: "icon.png" },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    artifactName: "Al-Berakah-Setup-${version}.${ext}"
  },
  publish: repo.length === 2 && repo[0] && repo[1]
    ? [{ provider: "github", owner: repo[0], repo: repo[1], releaseType: "release" }]
    : undefined
};
