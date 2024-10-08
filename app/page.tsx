"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import type { Feature } from "@/lib/types"

// Main Page Component
const MainPage = () => {
  const router = useRouter()
  const [features, setFeatures] = useState<Feature[]>([])

  useEffect(() => {
    // Fetch features list for landing page from API
    fetch('/api/get-features')
      .then(res => res.json())
      .then(data => setFeatures(data.features))
  }, [])

  const handleClick = (feature: Feature) => {
    // Generate UUID and navigate to the chat page with animation
    const uuid = uuidv4()
    // Navigate to chat page with the generated UUID
    router.push(`/chat/${uuid}`)
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-800 text-white flex items-center justify-center">
      {/* Scrolling feature buttons */}
      <TooltipProvider>
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full animate-scroll">
            <div className="flex flex-wrap justify-center items-center space-x-4 space-y-4">
              {features.map((feature: Feature) => (
                <Tooltip key={feature.index}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleClick(feature)}
                      className="rounded-full text-xl p-6 m-2 transition-transform duration-300 hover:scale-105"
                      style={{ background: "#1E293B", color: "#FFF" }}
                    >
                      {feature.emoji} {feature.title}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{feature.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            {/* Duplicate the content for infinite scrolling */}
            <div className="flex flex-wrap justify-center items-center space-x-4 space-y-4">
              {features.map((feature: Feature) => (
                <Tooltip key={`duplicate-${feature.index}`}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleClick(feature)}
                      className="rounded-full text-xl p-6 m-2 transition-transform duration-300 hover:scale-105"
                      style={{ background: "#1E293B", color: "#FFF" }}
                    >
                      {feature.emoji} {feature.title}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{feature.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default MainPage
