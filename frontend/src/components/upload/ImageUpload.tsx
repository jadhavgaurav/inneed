'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Image from 'next/image'
import { X, Upload, Loader2, ImagePlus } from 'lucide-react'

interface UploadedImage {
  publicId: string
  url: string
}

interface ImageUploadProps {
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
  label?: string
}

export function ImageUpload({ value, onChange, maxImages = 6, label = 'Upload Images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (value.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    try {
      // Get Cloudinary signature from backend
      const { data: sigData } = await api.post('/upload/signature', { fileType: 'listing-image' })

      const uploaded: UploadedImage[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', sigData.apiKey)
        formData.append('timestamp', String(sigData.timestamp))
        formData.append('signature', sigData.signature)
        formData.append('folder', sigData.folder)

        const res = await fetch(sigData.uploadUrl, { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        uploaded.push({ publicId: data.public_id, url: data.secure_url })
      }

      onChange([...value, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((img, i) => (
            <div key={img.publicId} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
              <Image src={img.url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 33vw, 200px" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">Cover</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {value.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${uploading ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="w-8 h-8" />
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs">JPG, PNG, WebP · Max {maxImages} images</p>
              <p className="text-xs">{value.length}/{maxImages} uploaded</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
