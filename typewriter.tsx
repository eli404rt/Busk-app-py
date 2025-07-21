"use client"

import { useState, useEffect } from "react"

export default function TypewriterEffect() {
  const text = "pity you didn't dedicate your life to Art"
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100) // Adjust typing speed here (100ms per character)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-white font-mono text-2xl md:text-4xl lg:text-5xl text-center leading-relaxed">
        <span>{displayedText}</span>
        <span className="animate-pulse">|</span>
      </div>
    </div>
  )
}
