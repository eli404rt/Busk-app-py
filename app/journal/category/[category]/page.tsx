import { getJournalPostsByCategory } from "@/lib/journal-data" // Updated import
import { BlogPostCard } from "@/components/blog-post-card" // Keep this import
import { BlogHeader } from "@/components/blog-header" // Keep this import

interface BlogCategoryPageProps {
  params: {
    category: string
  }
}

export default function BlogCategoryPage({ params }: BlogCategoryPageProps) { // Renamed for consistency
  const posts = getJournalPostsByCategory(params.category) // Updated function call

  return (
    <div className="min-h-screen bg-black text-white">
      <BlogHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center capitalize">
          Journal Entries in {decodeURIComponent(params.category)} {/* Updated title */}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  )
}
