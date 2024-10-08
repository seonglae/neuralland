"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import type { Feature } from "@/lib/types"

// Report Page Component
const ReportPage = ({ uuid }: { uuid: string }) => {
  const [reportData, setReportData] = useState<Feature[]>([])

  useEffect(() => {
    // Fetch report data for the current UUID from API
    fetch(`/api/chat-report?uuid=${uuid}`)
      .then(res => res.json())
      .then(data => setReportData(data.features))
  }, [uuid])

  return (
    <div className="w-full h-full p-8 bg-gray-900 text-white">
      <h1 className="text-3xl mb-8">Activation Report</h1>
      <div className="flex flex-wrap">
        {/* Render each feature as a card in the report */}
        {reportData.map(feature => (
          <Card key={feature.index} className="m-4 p-6 border-none bg-gray-800 text-white">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}


export default ReportPage