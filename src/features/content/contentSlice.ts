import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type TextElement, tokenize } from "../../lib/word-tokenizer"
import { toggleEdit } from "../navbar/navbarSlice"
import {
  getOrCreateTranscriptId,
  saveTranscript,
  loadTranscript,
} from "../../lib/transcript-storage"

export interface ContentSliceState {
  rawText: string
  textElements: TextElement[]
  finalTranscriptIndex: number
  interimTranscriptIndex: number
  transcriptId: string
  isLoading: boolean
  lastSavedAt: number | null
}

const initialText = 'Click on the "Edit" button and paste your content here...'

const initialState: ContentSliceState = {
  rawText: initialText,
  textElements: tokenize(initialText),
  finalTranscriptIndex: -1,
  interimTranscriptIndex: -1,
  transcriptId: "",
  isLoading: false,
  lastSavedAt: null,
}

export const contentSlice = createAppSlice({
  name: "content",

  // `createSlice` will infer the state type from the `initialState` argument
  initialState,

  // The `reducers` field lets us define reducers and generate associated actions
  reducers: create => ({
    setContent: create.reducer((state, action: PayloadAction<string>) => {
      state.rawText = action.payload
      state.finalTranscriptIndex = -1
      state.interimTranscriptIndex = -1
    }),

    setFinalTranscriptIndex: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.finalTranscriptIndex = action.payload
      },
    ),

    setInterimTranscriptIndex: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.interimTranscriptIndex = action.payload
      },
    ),

    resetTranscriptionIndices: create.reducer(state => {
      state.finalTranscriptIndex = -1
      state.interimTranscriptIndex = -1
    }),

    setTranscriptId: create.reducer((state, action: PayloadAction<string>) => {
      state.transcriptId = action.payload
    }),

    // Initialize transcript ID from URL
    initializeTranscriptId: create.asyncThunk(
      async () => {
        const transcriptId = getOrCreateTranscriptId()
        return transcriptId
      },
      {
        pending: state => {
          state.isLoading = true
        },
        fulfilled: (state, action) => {
          state.transcriptId = action.payload
          state.isLoading = false
        },
        rejected: state => {
          state.isLoading = false
        },
      },
    ),

    // Load transcript from Firestore
    loadTranscriptFromFirestore: create.asyncThunk(
      async (transcriptId: string) => {
        const data = await loadTranscript(transcriptId)
        return data
      },
      {
        pending: state => {
          state.isLoading = true
        },
        fulfilled: (state, action) => {
          if (action.payload) {
            state.rawText = action.payload.content
            state.textElements = tokenize(action.payload.content)
          }
          state.isLoading = false
        },
        rejected: state => {
          state.isLoading = false
        },
      },
    ),

    // Save transcript to Firestore
    saveTranscriptToFirestore: create.asyncThunk(
      async (
        { transcriptId, content }: { transcriptId: string; content: string },
        { getState },
      ) => {
        await saveTranscript(transcriptId, content)
        return Date.now()
      },
      {
        fulfilled: (state, action) => {
          state.lastSavedAt = action.payload
        },
      },
    ),
  }),

  extraReducers: builder =>
    builder.addCase(toggleEdit, state => {
      state.textElements = tokenize(state.rawText)
    }),

  selectors: {
    selectRawText: state => state.rawText,
    selectTextElements: state => state.textElements,
    selectFinalTranscriptIndex: state => state.finalTranscriptIndex,
    selectInterimTranscriptIndex: state => state.interimTranscriptIndex,
    selectTranscriptId: state => state.transcriptId,
    selectIsLoading: state => state.isLoading,
    selectLastSavedAt: state => state.lastSavedAt,
  },
})

export const {
  setContent,
  setFinalTranscriptIndex,
  setInterimTranscriptIndex,
  resetTranscriptionIndices,
  setTranscriptId,
  initializeTranscriptId,
  loadTranscriptFromFirestore,
  saveTranscriptToFirestore,
} = contentSlice.actions

export const {
  selectRawText,
  selectTextElements,
  selectFinalTranscriptIndex,
  selectInterimTranscriptIndex,
  selectTranscriptId,
  selectIsLoading,
  selectLastSavedAt,
} = contentSlice.selectors
