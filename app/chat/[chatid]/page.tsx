"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import type { Chat } from "@/lib/types"

const ChatPage = ({ params, searchParams }: { params: { chatid: string }, searchParams: { indice: string } }) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [inputValue, setInputValue] = useState('')
  const [leftMessages, setLeftMessages] = useState<{ query: string; response: any }[]>([])
  const [rightMessages, setRightMessages] = useState<{ query: string; response: any }[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch chat list
    fetch(`/api/chat-list?uuid=${params.chatid}`)
      .then(res => res.json())
      .then(data => {
        setLeftMessages(data.left || [])
        setRightMessages(data.right || [])
      })

    // Fetch all chat sessions
    fetch("/api/get-chat-title-list")
      .then(res => res.json())
      .then(data => setChats(data.chats))
  }, [params.chatid])

  const handleSend = () => {
    const indices = searchParams.indice.split(',').map((i: string) => parseInt(i, 10)).filter(i => !isNaN(i))

    if (inputValue.trim() === '') return

    fetch(`/api/act-gen?uuid=${params.chatid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputValue }),
    })
      .then(res => res.json())
      .then(data => {
        setLeftMessages(prev => [...prev, { query: inputValue, response: data.response }])
      })

    fetch(`/api/prompt-gen?uuid=${params.chatid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputValue }),
    })
      .then(res => res.json())
      .then(data => {
        setRightMessages(prev => [...prev, { query: inputValue, response: data.response }])
      })

    setInputValue('')
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-800 text-white">
      <div className="flex flex-1">
        {/* Left Column - Chat List */}
        <div className="w-1/6 p-4 flex flex-col relative bg-gray-700">
          <h2 className="text-lg font-bold mb-4 text-white">Chat List</h2>
          <div className="flex-1 overflow-y-auto">
            <ul>
              {chats.map((chat, index) => (
                <li key={index} className="text-gray-400 mb-2 cursor-pointer" onClick={() => router.push(`/chat/${chat.id}`)}>
                  {chat.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Column - Activation Engineering Chat */}
        <div className="w-5/12 p-4 flex flex-col relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl font-bold text-gray-900 opacity-70 text-center">
              Activation Engineering
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pt-16">
            {leftMessages.map((msg, index) => (
              <Card key={index} className="m-2 p-4 bg-gray-700 text-white border-gray-600">
                <p><strong>User:</strong> {msg.query}</p>
                <p><strong>Assistant:</strong> {msg.response}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Prompt Engineering Chat */}
        <div className="w-5/12 p-4 flex flex-col relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl font-bold text-gray-900 opacity-70 text-center">
              Prompt Engineering
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pt-16">
            {rightMessages.map((msg, index) => (
              <Card key={index} className="m-2 p-4 bg-gray-700 text-white border-gray-600">
                <p><strong>User:</strong> {msg.query}</p>
                <p><strong>Assistant:</strong> {msg.response}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Input field */}
      <div className="p-4 bg-gray-900 flex">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 mr-2 border-gray-500"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>

      {/* Activation Report Button */}
      <div className="fixed top-4 right-4">
        <Button
          onClick={() => router.push(`/report/${params.chatid}`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Activation Report
        </Button>
      </div>
    </div>
  )
}

export default ChatPage
