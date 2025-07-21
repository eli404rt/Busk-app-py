"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllJournalPosts } from "@/lib/journal-data"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { BlogPostCard } from "@/components/blog-post-card"

const TYPING_SPEED = 40
const PAUSE_AFTER_COMPLETE = 1000

export default function JournalPage() {
  const [posts] = useState(() => getAllJournalPosts())
  const [displayedText, setDisplayedText] = useState("")
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Get the most recent post content for animation
  const mostRecentPost = posts.length > 0 ? posts[0] : null
  const animationContent = mostRecentPost
    ? `${mostRecentPost.title}\n${mostRecentPost.excerpt}\n\n${mostRecentPost.content.substring(0, 500)}...`
    : "no journal entries found..."

  const handleTyping = useCallback(() => {
    if (currentCharIndex < animationContent.length) {
      setDisplayedText(animationContent.substring(0, currentCharIndex + 1))
      setCurrentCharIndex((prev) => prev + 1)
    } else {
      setTimeout(() => {
        setIsComplete(true)
      }, PAUSE_AFTER_COMPLETE)
    }
  }, [currentCharIndex, animationContent])

  useEffect(() => {
    if (!isComplete) {
      const timer = setTimeout(handleTyping, TYPING_SPEED)
      return () => clearTimeout(timer)
    }
  }, [handleTyping, isComplete])

  return (
    <div className="min-h-screen bg-black text-white">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isComplete ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-justify">
                {displayedText}
                <span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse"></span>
              </pre>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">journal entries</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
