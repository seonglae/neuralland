"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    // Generate UUID and navigate to the chat page
    const uuid = uuidv4() // Use UUID library to generate UUID
    // Navigate to chat page with the generated UUID
    router.push(`/chat/${uuid}`)
  }

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden relative bg-gray-900 text-white">
      {/* Render each feature as a button, styled to fill the entire screen like a Star Wars credits effect */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center animate-marquee space-x-4 max-h-screen">
        {features.map((feature: Feature) => (
          <TooltipProvider key={feature.index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleClick(feature)}
                  className="rounded-full text-xl shadow-lg hover:shadow-none m-2"
                  style={{ background: "#1E293B", color: "#FFF" }}
                >
                  {feature.emoji} {feature.title}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{feature.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}


export default MainPage