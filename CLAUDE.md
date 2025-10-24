# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-Activated Teleprompter is a web-based SPA that automatically scrolls text as you read it aloud using speech recognition. Built with Vite, React, Redux Toolkit, and Bulma. The app supports English, French, German, Italian, Brazilian Portuguese, and Spanish.

**Important:** This app is designed specifically for Chrome/Chromium browsers due to its use of the `webkitSpeechRecognition` API.

## Development Commands

Commands must be run by user on powershell. Do not run them as you are running on wsl.

```bash
# Install dependencies
npm install

# Run development server (opens browser automatically)
npm run dev
# or
npm start

# Build for production
npm run build

# Preview production build
npm preview

# Linting and formatting
npm run lint           # Check for lint errors
npm run lint:fix       # Auto-fix lint errors
npm run format         # Format code with Prettier
npm run type-check     # Run TypeScript type checking without emitting files
```

## Architecture

### Redux State Management

The app uses Redux Toolkit with a feature-based slice architecture:

- **authSlice** (`src/features/auth/authSlice.ts`): Manages authentication state
  - user: Current Firebase user object
  - isLoading: Loading state during login/logout
  - error: Authentication error messages
  - isInitialized: Whether auth state check is complete
  - Actions: login, logout, setUser

- **navbarSlice** (`src/features/navbar/navbarSlice.ts`): Manages UI controls and settings
  - Status: editing/started/stopped
  - Display settings: fontSize, margin, opacity, scrollOffset
  - Flip controls: horizontallyFlipped, verticallyFlipped
  - Language selection (persisted to localStorage)

- **contentSlice** (`src/features/content/contentSlice.ts`): Manages script text and transcription state
  - rawText: The script content
  - textElements: Tokenized version of the script (using word-tokenizer)
  - finalTranscriptIndex: Current position in script based on confirmed speech
  - interimTranscriptIndex: Preview position based on interim speech results
  - transcriptId: Firebase document ID for syncing
  - Auto-save functionality with 1-second debounce

Store configuration: `src/app/store.ts` combines slices using `combineSlices`

### Speech Recognition Core

The speech recognition system consists of three key libraries in `src/lib/`:

1. **speech-recognizer.ts**: Wrapper around browser's `webkitSpeechRecognition` API
   - Manages continuous speech recognition with interim and final results
   - Handles auto-restart on connection loss
   - Supports dynamic language switching

2. **word-tokenizer.ts**: Tokenizes script text into TOKEN and DELIMITER elements
   - Handles multilingual characters (Latin, Cyrillic, accented)
   - Special handling for bracketed hints: `[text]` treated as delimiters
   - Each element has: type, value, and index

3. **speech-matcher.ts**: The "secret sauce" - robust matching algorithm
   - Uses Levenshtein distance to match recognized speech against reference text
   - Tokenizes recognized speech and compares against reference tokens
   - Looks ahead in reference text (recognized_tokens.length * 2 + 10)
   - Finds best match by computing distances for all possible substrings
   - Returns token index for auto-scrolling

4. **levenshtein.ts**: Optimized Levenshtein distance implementation (from js-levenshtein, MIT license)

### Component Structure

- `src/main.tsx`: Entry point, renders App with Redux Provider
- `src/App.tsx`: Root component that handles authentication routing
  - Shows loading screen while checking auth state
  - Shows Login component if not authenticated
  - Shows NavBar + Content if authenticated
  - Sets up Firebase auth state listener on mount
- `src/features/auth/Login.tsx`: Login form with email/password fields
- `src/features/navbar/NavBar.tsx`: Toolbar with controls (edit, play/stop, settings, language, logout)
- `src/features/content/Content.tsx`: Main content area displaying script with highlighted position

### Styling

- Uses Bulma CSS framework (imported via SASS in `src/index.scss`)
- Bulma alias configured in `vite.config.ts` to resolve from node_modules
- Custom SCSS in `src/index.scss`

## Key Implementation Details

### Firebase Authentication

The app requires authentication to prevent unauthorized access:

**Configuration:**
- Firebase Auth: `src/lib/firebase.ts` (exports `auth` instance)
- Auth state management: `src/features/auth/authSlice.ts`
- Login component: `src/features/auth/Login.tsx`

**How it works:**
1. App checks auth state on load using `onAuthStateChanged`
2. If not authenticated, shows login screen
3. User logs in with email/password (no signup - accounts created in Firebase Console)
4. Auth state persists across sessions using Firebase's built-in persistence
5. Logout button available in navbar

**Managing users:**
- Users must be created manually in Firebase Console (Authentication > Users)
- No public signup functionality to maintain privacy
- Only email/password authentication is enabled

### Firebase Cloud Sync

The app uses Firebase Firestore for cross-device transcript synchronization:

**Configuration:**
- Firebase config: `src/lib/firebase.ts`
- Firestore service: `src/lib/transcript-storage.ts`
- Collection name: `transcripts`

**How it works:**
1. On app load, generates or reads transcript ID from URL hash (e.g., `#abc123def`)
2. Loads transcript from Firestore using the ID
3. Auto-saves changes after 1 second of inactivity (debounced)
4. Sharing the URL with the hash allows accessing the same transcript on any device

**Key functions:**
- `getOrCreateTranscriptId()`: Gets ID from URL hash or generates new one
- `saveTranscript(id, content)`: Saves to Firestore
- `loadTranscript(id)`: Loads from Firestore
- `subscribeToTranscript(id, callback)`: Real-time sync (not currently used)

### Language Support

Supported locales are defined in `navbarSlice.ts` as `SUPPORTED_LOCALES`. The app:
- Auto-detects browser language on first load
- Persists language selection to localStorage as `teleprompter-language`
- Updates speech recognizer when language changes

### Text Tokenization

The tokenizer (`word-tokenizer.ts:7`) treats bracketed text `[hint]` as special delimiters, allowing users to include non-spoken hints in their scripts.

### Speech Matching Algorithm

The core matching algorithm (`speech-matcher.ts:6`) uses Levenshtein distance to handle:
- Mispronunciations
- Going off-script briefly
- Speech recognition errors

It works by:
1. Tokenizing recognized speech
2. Creating a sliding window of reference tokens ahead of current position
3. Computing edit distances between recognized text and all possible reference substrings
4. Selecting the best match (minimum distance)

### Build Output

Production builds output to `dist/` directory (now ignored by git). Deploy using CI/CD instead of committing build files.
