# Event Director AI Command Center

Welcome to the Event Director AI Command Center, a sophisticated, AI-powered control panel for managing live events. Designed with the high-stakes atmosphere of an awards ceremony like the Oscars in mind, this application serves as a "Voice of God," a lighting and equipment director, and a real-time conversational assistant.

It leverages the power of the Google Gemini API to provide intelligent, low-latency assistance for everything from scriptwriting and troubleshooting to generating a complete, thematic event package from a single prompt.

## ✨ Core Features

- **AI Theme Creator**: A unified control panel to generate a cohesive set of event assets from a single theme prompt (e.g., "Underwater Gala"). All generated assets are interactive and can be instantly deployed to the live environment.
  - **Image Generation (`imagen-4.0-generate-001`)**: Create high-quality, thematic background images for the main broadcast screen.
  - **Video Animation (`veo-3.1-fast-generate-preview`)**: Animate the generated image into a short, dynamic video intro, playable on the main screen.
  - **Lighting Cues (`gemini-3-pro-preview`)**: Design complex lighting states that match the theme's mood and trigger them instantly.
  - **Visualizer Palettes (`gemini-3-pro-preview`)**: Create unique, 5-color schemes for the audio visualizer that dynamically theme the entire UI.

- **Main Broadcast Screen**: A central, multi-screen stage layout featuring an 8-panel LED video wall and two side screens that display AI-generated backdrops and videos, providing a visual anchor for the event.

- **Live Social Feed & Sentiment Analysis**:
  - **Real-time Feed**: Monitor a simulated live feed of social media posts about your event.
  - **AI Sentiment Summary (`gemini-3-pro-preview`)**: With one click, get an AI-generated analysis of the audience's mood, key discussion points, and overall sentiment.

- **AI-Powered Scripting**:
  - **Real-time Generation**: Create new script announcements on the fly with `gemini-2.5-flash-lite` for low-latency responses.
  - **Streaming Text**: Watch the AI write announcements word-by-word for a highly responsive feel.
  - **Improve & Refine**: Enhance existing script items with a single click, asking the AI for more cinematic phrasing.
  - **Full Regeneration**: Generate an entire 8-item event script with a single command using `gemini-3-pro-preview`.

- **"Voice of God" Announcer**:
  - **Cinematic TTS**: Use the `gemini-2.5-flash-preview-tts` model to generate high-quality, professional-sounding announcements.
  - **Customizable Voices**: Choose from a variety of thematic voices, each with a unique pitch and tone.
  - **Speed Control**: Adjust the speaking pace to match the energy of the event.

- **Live Conversational AI**:
  - **Real-time Voice Chat**: Engage in a natural, low-latency conversation with the AI director using the Gemini Live API.
  - **Instant Transcription**: See a live transcript of both your voice and the AI's response as you speak.

- **Equipment & Lighting Control**:
  - **Simulated Control**: Manage a virtual rack of lighting, audio, and video equipment with realistic brand/model names.
  - **Presets**: Save, load, update, reorder, and delete complex equipment configurations, including a theatrical "Phantom of the Opera" preset.
  - **AI Troubleshooting**: When a device "goes offline," an AI expert (`gemini-3-pro-preview`) provides a step-by-step diagnostic checklist.

- **Intelligent Event Management**:
  - **Real-Time Event Feed**: An "On Air" and "Up Next" panel keeps you aware of the current and upcoming script items.
  - **Dynamic Event Status**: Manually set the event's status (e.g., 'Live', 'Intermission') with clear visual indicators.
  - **AI Status Suggestions**: Get intelligent suggestions for the next logical event status based on the script context.
  - **Search Grounding**: Research equipment directly from the control panel using Google Search for up-to-date, verifiable information.

## 🚀 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API
  - `gemini-3-pro-preview` for complex generation (scripts, lighting cues, themes, troubleshooting, sentiment analysis).
  - `gemini-2.5-flash-lite` for fast, low-latency text generation.
  - `gemini-2.5-flash` with the `googleSearch` tool for grounded research.
  - `imagen-4.0-generate-001` for AI-powered image generation.
  - `veo-3.1-fast-generate-preview` for animating images into videos.
  - `gemini-2.5-flash-preview-tts` for Text-to-Speech.
  - `gemini-2.5-flash-native-audio-preview-09-2025` for the Live API conversational feature.
- **Real-time Simulation**: A mock WebSocket service to simulate equipment status updates.

## ⚙️ Setup and Running the Application

To run this application, you need a Google Gemini API key.

1.  **Get an API Key**:
    - Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate your free API key.

2.  **Create a `.env` file**:
    - In the root directory of the project, create a file named `.env`.

3.  **Add Your API Key**:
    - Open the `.env` file and add the following line, replacing `"YOUR_GEMINI_API_KEY"` with the key you just generated:
      ```
      API_KEY="YOUR_GEMINI_API_KEY"
      ```

4.  **Run the App**:
    - Once the `.env` file is in place, the application will automatically pick up the key and all features will be enabled. Note that some advanced features like video generation may require specific API access.

## 📂 File Structure

The project is organized into logical directories to keep the codebase clean and maintainable.

```
/
├── components/         # Reusable React components
│   ├── icons/          # SVG icon components
│   └── *.tsx           # Main UI components
├── hooks/              # Custom React hooks (e.g., useAudioPlayer)
├── services/           # Modules for external communication (Gemini API, WebSockets)
├── App.tsx             # Main application component, manages state
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── constants.ts        # Shared constants and configuration
└── utils.ts            # Helper functions
```