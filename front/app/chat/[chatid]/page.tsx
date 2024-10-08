"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

import type { Feature } from "@/lib/types"



// Chat Page Component
const ChatPage = ({ uuid }: { uuid: string }) => {
  const [messages, setMessages] = useState({ left: [], right: [] })
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    // Fetch chat list and feature recommendations from API
    fetch(`/api/chat-list?uuid=${uuid}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data)
        setLoading(false)
      })

    fetch(`/api/recommend-neuron?uuid=${uuid}`)
      .then(res => res.json())
      .then(data => setFeatures(data.features))
  }, [uuid])

  const handleSwitchToggle = (index: number) => {
    setFeatures(prevFeatures => {
      const newFeatures = [...prevFeatures]
      newFeatures[index].value = !newFeatures[index].value
      return newFeatures
    })
  }

  return (
    <div className="w-full h-full flex bg-gray-900 text-white">
      <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold text-gray-700 opacity-10">
        Prompt Engineering & Activation Engineering
      </div>

      {/* Left Column - Chat List */}
      <div className="w-1/4 p-4 bg-gray-800">
        <h2 className="text-lg font-bold mb-4 text-white">Chat List</h2>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="text-white" />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {messages.left.length === 0 && messages.right.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">No messages yet. Start a conversation!</div>
            ) : (
              <div className="text-white">Previous Chats</div>
            )}
          </div>
        )}
      </div>

      <Separator orientation="vertical" />

      {/* Middle Column - Activation Engineered Chat */}
      <div className="w-3/8 p-4 bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="text-white" />
          </div>
        ) : messages.left.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">No messages yet. Start a conversation!</div>
        ) : (
          messages.left.map((msg, index) => (
            <Card key={index} className="m-2 p-4 bg-gray-700 text-white">
              {msg}
            </Card>
          ))
        )}
      </div>

      <Separator orientation="vertical" />

      {/* Right Column - Non-engineered Chat */}
      <div className="w-3/8 p-4 bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="text-white" />
          </div>
        ) : messages.right.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">No messages yet. Start a conversation!</div>
        ) : (
          messages.right.map((msg, index) => (
            <Card key={index} className="m-2 p-4 bg-gray-700 text-white">
              {msg}
            </Card>
          ))
        )}
      </div>

      {/* Fixed bar for neuron switches and report button */}
      <div className="fixed top-4 right-4 p-4 bg-gray-800 rounded-full shadow-md">
        <Button className="rounded-full text-white" onClick={() => router.push(`/report/${uuid}`)}>Activation Report</Button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900 shadow-md">
        <div className="flex space-x-2">
          {/* Render neuron switches */}
          {features.map((feature, index) => (
            <div key={feature.index} className="flex items-center space-x-2">
              <Switch checked={feature.value} onCheckedChange={() => handleSwitchToggle(index)} />
              <span>{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatPage