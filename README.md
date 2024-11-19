# My Browser Extension

## Overview
This browser extension is designed to [briefly describe what your extension does]. It is compatible with [list browsers, e.g., Chrome, Firefox].

## Features
- Record audio
- Transcribe audio
- Generate a response using a T5 model
- Speak the response using the system TTS

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20.11.0 or higher)
- [npm](https://www.npmjs.com/) (version 10.1.0 or higher)

### Build the Extension
1. Clone the repository:
   ```bash
   git clone https://github.com/balconygames/chrome-spanish-teacher.git
   cd chrome-spanish-teacher
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Build the extension:
   ```bash
   bun run build
   ```

   This will generate the necessary files in the `dist` directory.

## Running in Development Mode

### Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" by toggling the switch in the top right corner.
3. Click "Load unpacked" and select the `dist` directory of your project.

### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on" and select any file in the `dist` directory of your project.

## Contributing
If you would like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License
This project is licensed under the [LICENSE](LICENSE) file for details.
