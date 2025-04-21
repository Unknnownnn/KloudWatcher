"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface FileUploadProps {
  disasterId: string
  onUploadComplete: (url: string) => void
}

export function FileUpload({ disasterId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${disasterId}/${Date.now()}.${fileExt}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('disaster-evidence')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('disaster-evidence')
        .getPublicUrl(fileName)

      onUploadComplete(publicUrl)
      toast({
        title: "File Uploaded",
        description: "Evidence has been successfully uploaded.",
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,.pdf"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Evidence"}
      </Button>
    </div>
  )
} 