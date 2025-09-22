# SkyCast AI Photo Editor

SkyCast is a modern, browser-based photo editor that leverages the power of the Google Gemini AI to provide an intuitive and powerful image editing experience. Users can perform complex edits like localized retouching, applying artistic filters, making professional adjustments, and removing backgrounds using simple text prompts and clicks—no complex tools required.

![SkyCast Screenshot](https://storage.googleapis.com/fpl-static-assets/misc/skycast_screenshot.png)

## ✨ Features

*   **🤖 AI-Powered Retouching**: Click any point on an image and describe your edit (e.g., "remove this person," "change my shirt color to red"). The AI performs a seamless, localized edit.
*   **🎨 Creative Filters**: Instantly transform the mood of your photos with preset filters like Synthwave and Anime, or describe your own unique style.
*   **🔧 Professional Adjustments**: Apply global enhancements like "blur the background" or "add studio lighting" with a single click or custom prompt.
*   **✂️ One-Click Background Removal**: Automatically detect the main subject and remove the background, making it transparent with high precision.
*   **🖼️ Standard Editing Tools**: Includes a non-destructive cropping tool with support for various aspect ratios (1:1, 16:9, free).
*   **⏳ Non-Destructive Workflow**:
    *   Full history tracking for every edit.
    *   Unlimited Undo and Redo capabilities.
    *   A "Compare" button to instantly view the original image.
    *   Reset to the original image at any time.
*   **🚀 No-Build Setup**: Runs directly in the browser using modern web standards (ESM) without requiring a complex build process.
*   **📱 Fully Responsive**: A clean user interface that works seamlessly on both desktop and mobile devices.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash-image-preview`)
*   **Module Loading**: [esm.sh](https://esm.sh/) (serves NPM packages as ES Modules)

## 📋 Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js & npm**: Required to run a local web server. You can download it from [nodejs.org](https://nodejs.org/).
2.  **A Google Gemini API Key**: You'll need an API key to make requests to the Gemini model. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 🚀 Getting Started: Local Installation

Follow these steps to run the SkyCast editor on your local machine.

### 1. Clone the Repository

First, clone this project's repository to your local machine using Git.

```bash
git clone https://github.com/your-username/skycast-photo-editor.git
cd skycast-photo-editor
```
*(Replace `your-username/skycast-photo-editor` with the actual repository URL if different.)*

### 2. Set Up Your API Key

The application loads your Gemini API key from an environment variable. You need to create a `.env` file in the root directory of the project.

1.  Create a new file named `.env`:
    ```bash
    touch .env
    ```

2.  Open the `.env` file and add your API key in the following format:
    ```
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

### 3. Install a Local Web Server

Since this project uses ES Modules, you need to serve the files from a local web server to avoid CORS errors. A simple, zero-configuration server like `serve` is perfect for this.

Install `serve` globally using npm:

```bash
npm install -g serve
```

### 4. Run the Application

Now, from the root of the project directory, start the server:

```bash
serve
```

The server will start and provide you with a local URL, typically `http://localhost:3000`. Open this URL in your web browser to start using the SkyCast AI Photo Editor!

##  usage

1.  **Launch**: Open the local URL provided by the `serve` command.
2.  **Upload**: Click "Upload an Image" or drag and drop a file onto the start screen.
3.  **Edit**: Use the tabs at the top to navigate between different editing modes:
    *   **Retouch**: Click a point on the image and type a prompt.
    *   **Adjust**: Choose a preset adjustment or write your own.
    *   **Filters**: Apply an artistic style.
    *   **Crop**: Select an area and apply the crop.
4.  **Manage History**: Use the Undo, Redo, Reset, and Compare buttons to navigate your edits.
5.  **Download**: When you're happy with the result, click "Download Image" to save your creation.

## 📁 Project Structure

```
.
├── index.html              # Main HTML entry point, loads scripts and styles
├── index.tsx               # Renders the main React App component
├── App.tsx                 # Core application logic, state management, and layout
├── components/             # Directory for all reusable React components
│   ├── AdjustmentPanel.tsx
│   ├── CropPanel.tsx
│   ├── FilterPanel.tsx
│   ├── Header.tsx
│   └── ...and more
├── services/
│   └── geminiService.ts    # Handles all API calls to the Google Gemini model
└── README.md               # You are here!
```

## 📄 License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for details.
