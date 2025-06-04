# Retroit

A Decentralized music player application with a **Spotify** inspired retro theme, focusing on offline mixtapes, moods, and AI-powered song recommendations, along with P2P File Sharing for direct browser to browser sharing of music files in mp3 and other formats.

## Features

- **Music Playback:** Enjoy your music library with a focus on "tapes" (playlists) and "moods", with **Spotify** inspired User Interface.
- **AI Song Recommendations:** Discover new tracks with the "For You" section, powered by AI.
- **Library Browsing and Search:** Easily find and play your favorite songs, artists, albums, and tapes.
- **Retro-themed UI:** A visually nostalgic interface.
- **Offline Focus:** Designed with offline playback in mind for your local music collection.
- **Planned P2P Music Sharing:** Share your music and mixtapes directly with friends in a secure, private way.
    - **Direct P2P Transfer:** Utilizes WebRTC technology for direct browser-to-browser file sharing, minimizing latency.
    - **Privacy-Focused:** No files are stored online. Sharing stops when you close your browser tab, ensuring your data remains in your control.
    - **Conceptual Inspiration:** Inspired by services like ToffeeShare, aiming to bring seamless and private P2P sharing to your music experience.

## Tech Stack

- **Framework:** Next.js (v15) with React (v18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Icons:** Lucide Icons
- **AI Integration:** Genkit (with Google AI)
- **Backend/Data (Potentially):** Firebase (dependency present)
- **Media Metadata:** jsmediatags
- **Charting:** Recharts
- **Schema Validation:** Zod

## Prerequisites

- Node.js (v20.x or later recommended)
- npm (v10.x or later) or yarn (v1.22.x or later)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd retroit
    ```
    *(Replace `<repository-url>` with the actual URL of the repository)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    Alternatively, if you prefer using yarn:
    ```bash
    yarn install
    ```

3.  **Environment Variables:**
    Currently, the project is set up to use mock data and should run without requiring a specific `.env` file for its core local functionalities. For advanced features like full Firebase integration or specific AI provider connections, you might need to set up environment variables. (Further details would be added here if specific variables are identified as necessary).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application on port 9002.

5.  **Open the application:**
    Open your browser and navigate to `http://localhost:9002`.

To utilize the AI features with Genkit, you might also need to run its development server (see 'Available Scripts' section).

## Available Scripts

-   `npm run dev`: Starts the Next.js development server with Turbopack (usually on `http://localhost:9002`).
-   `npm run genkit:dev`: Starts the Genkit development server for local AI flow testing. This typically runs on a different port (e.g., `http://localhost:3400`).
-   `npm run genkit:watch`: Starts the Genkit development server with file watching, automatically restarting when AI-related code changes.
-   `npm run build`: Builds the application for production deployment.
-   `npm run start`: Starts the production server after a build.
-   `npm run lint`: Runs ESLint to check for code quality and style issues.
-   `npm run typecheck`: Performs TypeScript type checking across the project.
-   `npm run postinstall`: This script runs automatically after package installation, using `patch-package` to apply any necessary modifications to dependencies.

## Project Structure

Here's a brief overview of the key directories in the Retroit project:

-   `src/`: Contains the main source code for the application.
    -   `src/app/`: Next.js App Router pages, defining the routes and views of the application.
    -   `src/components/`: Reusable React components used throughout the application.
        -   `src/components/ui/`: UI components, likely from a library like shadcn/ui or similar, built upon Radix UI.
    -   `src/ai/`: Houses AI-related logic, including Genkit flows (e.g., `recommend-songs.ts`).
    -   `src/contexts/`: React Context API providers (e.g., `PlayerContext` for managing music playback state).
    -   `src/data/`: Mock data used for development and showcasing features (e.g., `mockTapes`, `mockSongs`).
    -   `src/hooks/`: Custom React hooks.
    -   `src/lib/`: Utility functions and libraries.
    -   `src/types/`: TypeScript type definitions.
-   `public/`: Static assets that are served directly (e.g., images, favicon).
-   `patches/`: Contains patch files managed by `patch-package` for modifying `node_modules`.
-   `docs/`: Project documentation (like the blueprint.md).

This structure follows common Next.js conventions while organizing application-specific logic into relevant directories.

## AI Integration

Retroit leverages AI to provide features like personalized song recommendations. This is powered by **Genkit**, an open-source framework from Google for building AI-powered applications.

-   **Song Recommendations:** The "For You" section uses a Genkit flow defined in `src/ai/flows/recommend-songs.ts`. This flow likely processes listening history and song metadata to suggest relevant tracks.
-   **Development & Testing:** Genkit provides tools to run and test AI flows locally (e.g., `npm run genkit:dev`).
-   **Extensibility:** Using Genkit allows for potential future expansion with different AI models or providers.

The AI logic is primarily located in the `src/ai/` directory.

## Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to:

1.  Open an issue to discuss the proposed changes.
2.  Fork the repository and create a new branch for your feature or fix.
3.  Submit a pull request with a clear description of your changes.

We appreciate your help in making Retroit even better!

## License

License information for this project has not yet been specified. Please check back later or consult the project maintainers for details.

*(Consider adding a standard open-source license like MIT License or Apache 2.0 if appropriate for your project.)*
