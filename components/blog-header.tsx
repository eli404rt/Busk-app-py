"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Home, DollarSign } from "lucide-react"

interface BlogHeaderProps {
  onSearch?: (query: string) => void
}

export function BlogHeader({ onSearch }: BlogHeaderProps) {
  return (
    <header className="bg-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-xl font-mono text-white">
            agent4<span className="text-orange-400">0</span>4
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/tips">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                tips
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Home className="h-4 w-4 mr-2" />
                home
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="search"
            placeholder="search..."
            className="pl-10 bg-transparent border-gray-800 text-white placeholder-gray-500 focus:border-gray-600"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
    </header>
  )
}
