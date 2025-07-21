/*
 * ================================================================
 * THIS FILE IS NO LONGER USED - TIP FUNCTIONALITY MOVED TO /tips
 * ================================================================
 *
 * This file contained the tip page functionality which has been
 * moved to /tips route as per the latest requirements.
 *
 * This file can be safely deleted or kept for reference.
 * The new tips page is a coming soon page with typing animation.
 * ================================================================
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { TipButton } from "@/components/tip-button"

export default function TipPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Support the Art</h1>
          <p className="text-gray-300 text-lg">
            If my work has touched your heart or inspired your soul, consider leaving a tip. Every contribution helps
            fuel the creative journey.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <TipButton />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Alternative QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <Image src="/tip-qr-code.png" alt="Tip QR Code" width={200} height={200} className="mx-auto" />
              </div>
              <p className="text-gray-300 text-sm">
                Scan this QR code with your phone's camera as an alternative tipping method
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Why Support?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300">
                <h3 className="font-semibold text-white mb-2">🎵 Music Creation</h3>
                <p className="text-sm">Help fund new recordings, equipment, and studio time</p>
              </div>

              <div className="text-gray-300">
                <h3 className="font-semibold text-white mb-2">✍️ Content Creation</h3>
                <p className="text-sm">Support the time and effort that goes into writing and sharing</p>
              </div>

              <div className="text-gray-300">
                <h3 className="font-semibold text-white mb-2">🎨 Artistic Growth</h3>
                <p className="text-sm">Enable continued learning and artistic development</p>
              </div>

              <div className="pt-4">
                <p className="text-gray-400 text-xs italic">
                  "Art is not what you see, but what you make others see." - Edgar Degas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Every contribution, no matter the size, is deeply appreciated and goes directly toward creating more art.
          </p>
        </div>
      </main>
    </div>
  )
}
