"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const TYPING_SPEED = 100
const PAUSE_BEFORE_BLINK = 1000

export default function TipsPage() {
  const [displayedText, setDisplayedText] = useState("")
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  const text = "coming soon..."

  const handleTyping = useCallback(() => {
    if (currentCharIndex < text.length) {
      setDisplayedText(text.substring(0, currentCharIndex + 1))
      setCurrentCharIndex((prev) => prev + 1)
    } else {
      setTimeout(() => {
        setIsComplete(true)
      }, PAUSE_BEFORE_BLINK)
    }
  }, [currentCharIndex, text])

  useEffect(() => {
    if (!isComplete) {
      const timer = setTimeout(handleTyping, TYPING_SPEED)
      return () => clearTimeout(timer)
    }
  }, [handleTyping, isComplete])

  // Cursor blinking effect after completion
  useEffect(() => {
    if (isComplete) {
      const interval = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isComplete])

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <button className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center px-3 py-2 rounded transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              back to home
            </button>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-8">
        <div className="text-white font-mono text-xl md:text-3xl lg:text-4xl text-center">
          {displayedText}
          {(showCursor || !isComplete) && <span className="inline-block w-1 h-6 md:h-8 lg:h-10 bg-white ml-2"></span>}
        </div>
      </main>
    </div>
  )
}
