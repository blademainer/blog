export const products = [
  {
    slug: "mac-screen-capture",
    name: "MacScreenCapture",
    shortName: "MacScreenCapture",
    category: "屏幕工具",
    tagline: "截下灵感，表达清楚。",
    description:
      "截图、标注、录屏，一次完成。为 macOS 打造的开源屏幕工具，让分享更直接。",
    platform: "macOS 15+",
    architectures: "Apple Silicon / Intel",
    license: "MIT 开源",
    labels: ["macOS 15+", "Universal", "MIT 开源"],
    featured: true,
    icon: "/assets/app-icon.png",
    screenshot: "/assets/capture-main.png",
    repository: "https://github.com/blademainer/screen-capture",
    releases: "https://github.com/blademainer/screen-capture/releases",
    issues: "https://github.com/blademainer/screen-capture/issues",
    fallbackRelease: {
      tag_name: "v1.0.1-ci.20261115.1",
      prerelease: true,
      draft: false,
      html_url:
        "https://github.com/blademainer/screen-capture/releases/tag/v1.0.1-ci.20261115.1",
      assets: [
        {
          name: "MacScreenCapture-1.0.1-ci.20261115.1-universal-macOS.dmg",
          browser_download_url:
            "https://github.com/blademainer/screen-capture/releases/download/v1.0.1-ci.20261115.1/MacScreenCapture-1.0.1-ci.20261115.1-universal-macOS.dmg",
        },
        {
          name: "MacScreenCapture-1.0.1-ci.20261115.1-universal-macOS.zip",
          browser_download_url:
            "https://github.com/blademainer/screen-capture/releases/download/v1.0.1-ci.20261115.1/MacScreenCapture-1.0.1-ci.20261115.1-universal-macOS.zip",
        },
      ],
    },
  },
];

export const featuredProduct = products.find((product) => product.featured);
