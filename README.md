# USD Converter for av.by v2.0 🚀

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-v2.0.0-blue.svg)](https://chromewebstore.google.com/detail/jbgcmehjngblmjcdpmjmhkbmajccjoco)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, fast, and beautiful extension that automatically converts vehicle prices on [av.by](https://av.by) to USD, EUR, or RUB.

## ✨ What's New in v2.0 (Major Update)
*   **💎 Premium Design**: Fully aligned with av.by's brand identity. Integrated brand fonts (**Montserrat**, **Open Sans**) and color palette.
*   **🌀 Native Experience**: Shimmer effects, smooth transitions, glassmorphism, and haptic-like UI feedback.
*   **📊 Precision & Clarity**: 4-decimal exchange rates with smart color-coding and visual hierarchy.
*   **⚡️ Reactive Core**: Instant price conversion even on dynamically loaded content (infinite scroll).

## 📥 [Install from Chrome Web Store](https://chromewebstore.google.com/detail/jbgcmehjngblmjcdpmjmhkbmajccjoco)

## Features
-   **Real-time Conversion**: Automatically fetches the latest exchange rates and displays them right under the original BYN prices.
-   **Multi-source Fallback**: Robust priority-based system (Site DOM -> NBRB -> Frankfurter -> ExchangeRate-API).
-   **Smart Caching**: Local caching for 1 hour to ensure speed and bypass API limits.
-   **Privacy First**: No tracking, no extra permissions, just pure utility.

## Development
Built with **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Vite**.

### Prerequisites
- Node.js >= 20
- yarn

### Quick Start
1.  Install dependencies:
    ```bash
    yarn install
    ```
2.  Run in development mode:
    ```bash
    yarn dev:chrome
    ```
3.  Build for production:
    ```bash
    yarn build:chrome
    ```

Production build will be available in the `dist_chrome` directory.

## License
[MIT License](LICENSE)
