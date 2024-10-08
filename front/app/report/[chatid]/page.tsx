"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import type { Feature } from "@/lib/types"

// Report Page Component
const ReportPage = () => {
  const { uuid } = useParams()
  const [reportData, setReportData] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch report data for the current UUID from API
    fetch(`/api/chat-report?uuid=${uuid}`)
      .then(res => res.json())
      .then(data => {
        setReportData(data.features)
        setLoading(false)
      })
      .catch(() => {
        // Handle error
        setLoading(false)
      })
  }, [uuid])

  return (
    <div className="w-full h-screen p-8 bg-gray-800 text-white">
      <h1 className="text-3xl mb-8">Activation Report</h1>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      ) : reportData.length === 0 ? (
        <div className="text-center text-gray-500">No report data available.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Render each feature as a card in the report */}
          {reportData.map(feature => (
            <Card key={feature.index} className="p-6 bg-gray-700 border-gray-600">
              <h2 className="text-xl mb-2">{feature.title}</h2>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReportPage
