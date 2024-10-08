"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

import type { Feature } from "@/lib/types"

import { useChat } from 'ai/react' // Vercel AI SDK

// Chat Page Component
const ChatPage = () => {
  const { uuid } = useParams()
  const [features, setFeatures] = useState<Feature[]>([])
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')

  // Using Vercel AI SDK's useChat hook for streaming responses
  const { messages: leftMessages, append: appendLeft } = useChat({
    // Options for the engineered chat
    api: `/api/act-gen?uuid=${uuid}`,
  })

  const { messages: rightMessages, append: appendRight } = useChat({
    // Options for the non-engineered chat
    api: `/api/prompt-gen?uuid=${uuid}`,
  })

  useEffect(() => {
    // Fetch features from API
    fetch(`/api/recommend-neuron?uuid=${uuid}`)
      .then(res => res.json())
      .then(data => {
        setFeatures(data.features)
      })
  }, [uuid])

  const handleSwitchToggle = (index: number) => {
    setFeatures(prevFeatures => {
      const newFeatures = [...prevFeatures]
      newFeatures[index].value = !newFeatures[index].value
      return newFeatures
    })
  }

  const handleSend = () => {
    // Send message to both APIs
    if (inputValue.trim() === '') return

    // For the engineered chat
    appendLeft({
      role: 'user',
      content: inputValue,
    })

    // For the non-engineered chat
    appendRight({
      role: 'user',
      content: inputValue,
    })

    setInputValue('')
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-800 text-white">
      <div className="flex flex-1">
        {/* Left Column - Activation Engineered Chat */}
        <div className="w-1/2 p-4 flex flex-col relative">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl font-bold text-gray-700 opacity-10">
              Activation Engineering
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pt-16">
            {leftMessages.map((msg, index) => (
              <Card key={index} className="m-2 p-4 bg-gray-700 text-white border-gray-600">
                {msg.content}
              </Card>
            ))}
            {/* Neuron Switches below the last message */}
            {leftMessages.length > 0 && (
              <div className="flex space-x-4 mt-4">
                {features.map((feature, index) => (
                  <div key={feature.index} className="flex items-center space-x-2">
                    <Switch
                      checked={feature.value}
                      onCheckedChange={() => handleSwitchToggle(index)}
                    />
                    <span>{feature.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Prompt Engineering Chat */}
        <div className="w-1/2 p-4 flex flex-col relative">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl font-bold text-gray-700 opacity-10">
              Prompt Engineering
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pt-16">
            {rightMessages.map((msg, index) => (
              <Card key={index} className="m-2 p-4 bg-gray-700 text-white border-gray-600">
                {msg.content}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Input field spanning both columns */}
      <div className="p-4 bg-gray-900 flex">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 mr-2"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>

      {/* Activation Report Button */}
      <div className="fixed top-4 right-4">
        <Button
          onClick={() => router.push(`/report/${uuid}`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Activation Report
        </Button>
      </div>
    </div>
  )
}

export default ChatPage
