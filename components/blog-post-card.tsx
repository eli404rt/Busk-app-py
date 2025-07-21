import Link from "next/link"
import type { JournalPost } from "@/lib/journal-data"

interface BlogPostCardProps {
  post: JournalPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  return (
    <div className="py-6 border-b border-gray-900 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <Link href={`/journal/${post.slug}`}>
          <h2 className="text-white hover:text-gray-300 transition-colors text-lg font-medium">{post.title}</h2>
        </Link>
        <span className="text-gray-500 text-sm font-mono ml-4 flex-shrink-0">{formatTimestamp(post.publishedAt)}</span>
      </div>

      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{post.excerpt}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-600">
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag} href={`/journal/tag/${tag}`} className="hover:text-gray-400">
              #{tag}
            </Link>
          ))}
        </div>
        <span className="text-xs text-gray-600 font-mono">{post.views} views</span>
      </div>
    </div>
  )
}
