# Event Director AI Command Center

Welcome to the Event Director AI Command Center, a sophisticated, AI-powered control panel for managing live events. Designed with the high-stakes atmosphere of an awards ceremony like the Oscars in mind, this application serves as a "Voice of God," a lighting and equipment director, and a real-time conversational assistant.

It leverages the power of the Google Gemini API to provide intelligent, low-latency assistance for everything from scriptwriting to technical troubleshooting.

## ✨ Core Features

- **AI-Powered Scripting**:
  - **Real-time Generation**: Create new script announcements on the fly with `gemini-2.5-flash-lite` for low-latency responses.
  - **Streaming Text**: Watch the AI write announcements word-by-word for a highly responsive feel.
  - **Improve & Refine**: Enhance existing script items with a single click, asking the AI for more cinematic or professional phrasing.
  - **Full Regeneration**: Generate an entire 8-item event script with a single command using `gemini-3-pro-preview`.

- **"Voice of God" Announcer**:
  - **Cinematic TTS**: Use the `gemini-2.5-flash-preview-tts` model to generate high-quality, professional-sounding announcements.
  - **Customizable Voices**: Choose from a variety of thematic voices, each with a unique pitch and tone.
  - **Speed Control**: Adjust the speaking pace to match the energy of the event.

- **Live Conversational AI**:
  - **Real-time Voice Chat**: Engage in a natural, low-latency conversation with the AI director using the Gemini Live API.
  - **Instant Transcription**: See a live transcript of both your voice and the AI's response as you speak.

- **Dynamic Audio Visualizer**:
  - **Real-time Visualization**: A beautiful, responsive audio visualizer provides a live broadcast feed, perfect for on-stage video walls.
  - **Multiple Styles**: Switch between a fluid 'Waveform' and energetic 'Frequency Bars'.
  - **AI-Generated Themes**: Describe a mood or concept (e.g., "cyberpunk city") and have `gemini-3-pro-preview` generate a unique 5-color palette for the visualizer.

- **Equipment & Lighting Control**:
  - **Simulated Control**: Manage a virtual rack of lighting, audio, and video equipment.
  - **Presets**: Save, load, update, reorder, and delete complex equipment configurations.
  - **AI-Generated Lighting Cues**: Describe a scene (e.g., "dramatic winner spotlight") and let `gemini-3-pro-preview` create the corresponding lighting cue.
  - **AI Troubleshooting**: When a device "goes offline," an AI expert (`gemini-3-pro-preview`) provides a step-by-step diagnostic checklist.

- **Intelligent Event Management**:
  - **Real-Time Event Feed**: An "On Air" and "Up Next" panel keeps you aware of the current and upcoming script items.
  - **Dynamic Event Status**: Manually set the event's status (e.g., 'Live', 'Intermission') with clear visual indicators.
  - **AI Status Suggestions**: Get intelligent suggestions for the next logical event status based on the script context.

## 🚀 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API
  - `gemini-3-pro-preview` for complex generation (scripts, lighting cues, themes, troubleshooting).
  - `gemini-2.5-flash-lite` for fast, low-latency text generation.
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
    - Once the `.env` file is in place, the application will automatically pick up the key and all features will be enabled.

## 📂 File Structure

The project is organized into logical directories to keep the codebase clean and maintainable.

```
/
├── components/         # Reusable React components
│   ├── icons/          # SVG icon components
│   └── *.tsx           # Main UI components
├── hooks/              # Custom React hooks (e.g., useAudioPlayer)
├── services/           # Modules for external communication (Gemini API, WebSockets)
├── public/             # Static assets (if any)
├── App.tsx             # Main application component, manages state
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── constants.ts        # Shared constants and configuration
└── utils.ts            # Helper functions
```
