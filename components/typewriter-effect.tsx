"use client" // This must be the absolute first line of the file

import { useState, useEffect, useCallback } from "react"
import { User, BookOpen, ImageIcon, DollarSign, Instagram, Facebook, Youtube } from "lucide-react"

// Define a simple Button component inline with new styling
const Button = ({ children, className, onClick, ...props }) => {
  // New styling for the buttons: transparent by default, with gradient and scale on hover
  const baseClasses =
    "rounded-full font-medium text-center inline-flex items-center justify-center transition-all duration-300 ease-in-out"
  const newClasses =
    "bg-transparent text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:scale-105" // Subtle gradient and scale

  return (
    <button
      className={`${baseClasses} ${newClasses} ${className} px-6 py-3`} // Added padding for consistent size
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const quotes = [
  `Perhaps we can't stop war.`,
  `War is the death of imagination`,
  `Imagination has many enemies`,
  `Children have no enemies.`,
  `Children are the birth of imagination.`,
  `Perhaps we CAN stop war... ?`,
  `Thanks for helping me write that.`,
  `Gord Downie (September 16th, 2000) Treaty One Territory, The Forks Winnipeg, Canada`,
  `I only tell you this Courage, because you're a friend of mine. If my name was courage, I'd wanna be on time`,
  `You ain't good looking, and your name is Courage. You better be on time.`,
] // Quotes from Gord Downie / The Tragically Hip

const TYPING_SPEED = 80 // milliseconds per character
const DELETING_SPEED = 50 // milliseconds per character
const PAUSE_AFTER_TYPE = 3000 // milliseconds (Increased pause before deleting)
const PAUSE_AFTER_DELETE = 700 // milliseconds
const BUTTON_FADE_IN_PERCENTAGE = 0.3 // Percentage of the first quote length (Fade in sooner)

export default function TypewriterEffect() {
  const [displayedText, setDisplayedText] = useState("")
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  const currentQuote = quotes[quoteIndex]

  const handleTyping = useCallback(() => {
    if (!isDeleting) {
      if (charIndex < currentQuote.length) {
        setDisplayedText(currentQuote.substring(0, charIndex + 1))
        setCharIndex((prev) => prev + 1)
        // Show buttons when a certain percentage of the first quote is typed
        if (
          quoteIndex === 0 &&
          charIndex >= Math.floor(currentQuote.length * BUTTON_FADE_IN_PERCENTAGE) &&
          !showButtons
        ) {
          setShowButtons(true)
        }
      } else {
        // Pause after typing, then start deleting
        setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE)
      }
    } else {
      if (charIndex > 0) {
        setDisplayedText(currentQuote.substring(0, charIndex - 1))
        setCharIndex((prev) => prev - 1)
      } else {
        // Pause after deleting, then move to the next quote and start typing
        setIsDeleting(false)
        setQuoteIndex((prev) => (prev + 1) % quotes.length)
        setTimeout(() => {}, PAUSE_AFTER_DELETE)
      }
    }
  }, [charIndex, currentQuote, isDeleting, quoteIndex, showButtons])

  useEffect(() => {
    const timer = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED)
    return () => clearTimeout(timer)
  }, [handleTyping, isDeleting])

  // Determine if the cursor should be visible
  const isCursorVisible = !isDeleting || (isDeleting && charIndex > 0)

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursor-blink 0.8s infinite step-end;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* New bounce animation for icons */
        @keyframes bounce-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.6s ease-out forwards;
          animation-delay: 0.1s;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out forwards;
          animation-delay: 0.2s;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out forwards;
          animation-delay: 0.3s;
        }
        .animate-fade-in-delay-4 {
          animation: fade-in 0.6s ease-out forwards;
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 z-20">
        <a href="/journal" className="text-2xl font-mono text-white">
          agent4<span className="text-orange-400">0</span>4
        </a>
      </div>

      {showButtons && (
        <div className="fixed top-0 left-0 right-0 z-10 flex flex-wrap gap-6 justify-center items-center bg-black bg-opacity-70 p-4">
          <a href="/whoami">
            <Button className="group opacity-0 animate-fade-in-delay-1">
              <User className="mr-3 h-4 w-4 text-orange-400 group-hover:animate-bounce-icon transition-colors duration-300" />
              whoami
            </Button>
          </a>

          <a href="/journal">
            <Button className="group opacity-0 animate-fade-in-delay-2">
              <BookOpen className="mr-3 h-4 w-4 text-orange-400 group-hover:animate-bounce-icon transition-colors duration-300" />
              journal
            </Button>
          </a>

          <a href="/gallery">
            <Button className="group opacity-0 animate-fade-in-delay-3">
              <ImageIcon className="mr-3 h-4 w-4 text-orange-400 group-hover:animate-bounce-icon transition-colors duration-300" />
              gallery
            </Button>
          </a>

          <a href="/tips">
            <Button className="group opacity-0 animate-fade-in-delay-4">
              <DollarSign className="mr-3 h-4 w-4 text-orange-400 group-hover:animate-bounce-icon transition-colors duration-300" />
              tips
            </Button>
          </a>
        </div>
      )}

      <div className="flex flex-col items-center justify-center flex-grow pt-28 px-8">
        <div className="text-white font-mono text-xl md:text-3xl lg:text-4xl text-center leading-relaxed mb-12 max-w-4xl">
          <pre className="whitespace-pre-wrap font-mono inline">
            {displayedText}
            {/* Cursor element placed directly after displayedText without italic-cursor class */}
            {isCursorVisible && (
              <span className="inline-block w-1 h-6 md:h-8 lg:h-10 bg-white ml-2 animate-cursor-blink"></span>
            )}
          </pre>
        </div>
      </div>

      {/* Bottom Center Social Media Icons */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-6">
        <a
          href="https://instagram.com/eli_cadieux"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <Instagram className="h-8 w-8" />
        </a>
        <a
          href="https://facebook.com/eli_cadieux"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <Facebook className="h-8 w-8" />
        </a>
        <a
          href="https://youtube.com/@eli_cadieux"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-300"
        >
          <Youtube className="h-8 w-8" />
        </a>
      </div>
    </div>
  )
}
