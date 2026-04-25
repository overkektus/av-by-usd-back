# AV.BY USD Converter

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-green.svg)](https://chromewebstore.google.com/detail/jbgcmehjngblmjcdpmjmhkbmajccjoco)

A lightweight, fast, and reliable extension that automatically converts vehicle prices on [av.by](https://av.by) to USD.

## 📥 [Install from Chrome Web Store](https://chromewebstore.google.com/detail/jbgcmehjngblmjcdpmjmhkbmajccjoco)

## Features
- **Real-time Conversion**: Automatically fetches the latest exchange rates to provide accurate USD prices right under the original BYN prices.
- **Multiple Reliable Sources**: Uses a robust priority-based fallback system (NBRB -> Frankfurter -> ExchangeRate-API) to ensure exchange rates are always available.
- **High Performance**: Uses an optimized `MutationObserver` with debouncing to seamlessly convert prices on dynamically loaded pages without slowing down your browser.
- **Smart Caching**: Caches exchange rates locally (`chrome.storage.local`) for 1 hour to prevent API rate-limiting and save network requests.
- **Privacy First**: No tracking, no analytics, and no extra permissions needed (only `storage`).

## Development
This extension is built using Vanilla TypeScript and Vite, ensuring a zero-bloat, lightning-fast bundle.

### Prerequisites
- Node.js >= 18
- yarn or npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd av-by-usd-back
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```

### Building
To build a production-ready version for Chrome:
```bash
yarn build:chrome
```
This will generate a `dist_chrome` folder containing the unpacked extension, which you can load into Chrome via `chrome://extensions/` -> **Load unpacked**.

## License
[MIT License](LICENSE)
