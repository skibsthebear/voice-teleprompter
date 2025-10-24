import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"

const COLLECTION_NAME = "transcripts"

export interface TranscriptData {
  content: string
  updatedAt: number
}

/**
 * Generate a random transcript ID
 */
export const generateTranscriptId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Get the transcript ID from URL hash, or generate a new one
 */
export const getOrCreateTranscriptId = (): string => {
  const hash = window.location.hash.substring(1)
  if (hash && hash.length > 0) {
    return hash
  }

  const newId = generateTranscriptId()
  window.location.hash = newId
  return newId
}

/**
 * Save transcript to Firestore
 */
export const saveTranscript = async (
  transcriptId: string,
  content: string,
): Promise<void> => {
  const transcriptRef = doc(db, COLLECTION_NAME, transcriptId)
  await setDoc(transcriptRef, {
    content,
    updatedAt: Date.now(),
  })
}

/**
 * Load transcript from Firestore
 */
export const loadTranscript = async (
  transcriptId: string,
): Promise<TranscriptData | null> => {
  const transcriptRef = doc(db, COLLECTION_NAME, transcriptId)
  const docSnap = await getDoc(transcriptRef)

  if (docSnap.exists()) {
    return docSnap.data() as TranscriptData
  }

  return null
}

/**
 * Subscribe to real-time transcript updates
 */
export const subscribeToTranscript = (
  transcriptId: string,
  callback: (data: TranscriptData | null) => void,
): (() => void) => {
  const transcriptRef = doc(db, COLLECTION_NAME, transcriptId)

  const unsubscribe = onSnapshot(transcriptRef, docSnap => {
    if (docSnap.exists()) {
      callback(docSnap.data() as TranscriptData)
    } else {
      callback(null)
    }
  })

  return unsubscribe
}
