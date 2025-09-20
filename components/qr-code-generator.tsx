"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCodeIcon, DownloadIcon } from "lucide-react"

interface QRCodeGeneratorProps {
  shortUrl: string
}

export function QRCodeGenerator({ shortUrl }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `qr-code-${shortUrl.split("/").pop()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5" />
          QR Code
        </CardTitle>
        <CardDescription>Generate a QR code for easy sharing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCodeUrl ? (
          <Button onClick={generateQRCode} disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="border rounded-lg" />
            </div>
            <Button onClick={downloadQRCode} variant="outline" className="w-full bg-transparent">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
