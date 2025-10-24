import { useEffect, useLayoutEffect, useRef } from "react"
import { escape } from "html-escaper"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  setContent,
  setFinalTranscriptIndex,
  setInterimTranscriptIndex,
  initializeTranscriptId,
  loadTranscriptFromFirestore,
  saveTranscriptToFirestore,
} from "./contentSlice"

import {
  selectStatus,
  selectHorizontallyFlipped,
  selectVerticallyFlipped,
  selectFontSize,
  selectMargin,
  selectOpacity,
  selectScrollOffset,
} from "../navbar/navbarSlice"

import {
  selectRawText,
  selectTextElements,
  selectFinalTranscriptIndex,
  selectInterimTranscriptIndex,
  selectTranscriptId,
  selectIsLoading,
  selectHasUnsavedChanges,
} from "./contentSlice"

export const Content = () => {
  const dispatch = useAppDispatch()

  const status = useAppSelector(selectStatus)
  const fontSize = useAppSelector(selectFontSize)
  const margin = useAppSelector(selectMargin)
  const opacity = useAppSelector(selectOpacity)
  const scrollOffset = useAppSelector(selectScrollOffset)
  const horizontallyFlipped = useAppSelector(selectHorizontallyFlipped)
  const verticallyFlipped = useAppSelector(selectVerticallyFlipped)
  const rawText = useAppSelector(selectRawText)
  const textElements = useAppSelector(selectTextElements)
  const finalTranscriptIndex = useAppSelector(selectFinalTranscriptIndex)
  const interimTranscriptIndex = useAppSelector(selectInterimTranscriptIndex)
  const transcriptId = useAppSelector(selectTranscriptId)
  const isLoading = useAppSelector(selectIsLoading)
  const hasUnsavedChanges = useAppSelector(selectHasUnsavedChanges)

  const style = {
    fontSize: `${fontSize}px`,
    padding: `0 ${margin}px`,
  }

  const containerRef = useRef<null | HTMLDivElement>(null)
  const lastRef = useRef<null | HTMLDivElement>(null)
  const bottomSpacerRef = useRef<null | HTMLDivElement>(null)

  // Initialize transcript ID on mount
  useEffect(() => {
    dispatch(initializeTranscriptId())
  }, [dispatch])

  // Load transcript from Firestore when transcript ID is set
  useEffect(() => {
    if (transcriptId) {
      dispatch(loadTranscriptFromFirestore(transcriptId))
    }
  }, [dispatch, transcriptId])

  // No auto-save - user must click Save button manually

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (containerRef.current) {
      if (lastRef.current) {
        containerRef.current.scrollTo({
          top: Math.max(lastRef.current.offsetTop - scrollOffset, 0),
          behavior: "smooth",
        })
      } else {
        containerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
    }
  })

  useLayoutEffect(() => {
    if (!containerRef.current || !bottomSpacerRef.current) {
      return
    }

    const containerHeight = containerRef.current.clientHeight
    bottomSpacerRef.current.style.height = `${scrollOffset + containerHeight}px`
  }, [scrollOffset, textElements.length])

  return (
    <main className="content-area">
      {isLoading && status !== "editing" ? (
        <div className="content" style={style}>
          <p>Loading transcript...</p>
        </div>
      ) : status === "editing" ? (
        <>
          {hasUnsavedChanges && (
            <div
              className="notification is-warning"
              style={{
                margin: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i> You have
              unsaved changes! Click the{" "}
              <strong>Save button (floppy disk icon)</strong> in the toolbar to
              save your changes.
            </div>
          )}
          <textarea
            className="content"
            style={style}
            value={rawText}
            onChange={e => dispatch(setContent(e.target.value || ""))}
          />
        </>
      ) : (
        <div
          className="content"
          ref={containerRef}
          style={{
            ...style,
            opacity: opacity / 100,
            transform: `scale(${horizontallyFlipped ? "-1" : "1"}, ${verticallyFlipped ? "-1" : "1"})`,
          }}
        >
          {textElements.map((textElement, index, array) => {
            const itemProps =
              interimTranscriptIndex > 0 &&
              index === Math.min(interimTranscriptIndex + 2, array.length - 1)
                ? { ref: lastRef }
                : {}
            return (
              <span
                key={textElement.index}
                onClick={() => {
                  dispatch(setFinalTranscriptIndex(index - 1))
                  dispatch(setInterimTranscriptIndex(index - 1))
                }}
                className={
                  finalTranscriptIndex > 0 &&
                  textElement.index <= finalTranscriptIndex + 1
                    ? "final-transcript"
                    : interimTranscriptIndex > 0 &&
                        textElement.index <= interimTranscriptIndex + 1
                      ? "interim-transcript"
                      : "has-text-white"
                }
                {...itemProps}
                dangerouslySetInnerHTML={{
                  __html: escape(textElement.value).replace(/\n/g, "<br>"),
                }}
              />
            )
          })}
          <div
            aria-hidden="true"
            ref={bottomSpacerRef}
            style={{ height: 0, flexShrink: 0 }}
          />
        </div>
      )}
    </main>
  )
}
