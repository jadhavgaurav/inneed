'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Mail, Phone, Shield, Edit2, Save, X, Camera, Package, ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    try {
      await api.patch('/auth/me', data)
      await refreshUser()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      // Get Cloudinary signature
      const { data: sigData } = await api.post('/upload/signature', { fileType: 'listing-image' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sigData.apiKey)
      formData.append('timestamp', String(sigData.timestamp))
      formData.append('signature', sigData.signature)
      formData.append('folder', `inneed/avatars/${user.id}`)

      const res = await fetch(sigData.uploadUrl, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const uploadData = await res.json()

      await api.patch('/auth/me', { avatar: uploadData.secure_url })
      await refreshUser()
      toast.success('Avatar updated!')
    } catch (e: any) {
      toast.error(e.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const cancelEdit = () => {
    reset({ name: user.name })
    setEditing(false)
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Header card */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>
              {/* Upload button overlay */}
              <label
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                title="Change avatar"
              >
                {uploadingAvatar ? (
                  <div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      {...register('name')}
                      autoFocus
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 border border-border px-4 py-1.5 rounded-lg text-sm hover:bg-accent"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' :
                      user.isVendorApproved ? 'bg-green-100 text-green-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {user.role === 'ADMIN' ? 'Admin' : user.isVendorApproved ? 'Verified Vendor' : 'Customer'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(user.createdAt ?? Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Account Details</h2>
          <div className="space-y-4">
            {user.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">+91 {user.phone}</p>
                </div>
              </div>
            )}
            {user.googleId && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Google Account</p>
                  <p className="text-sm font-medium text-green-600">Connected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/orders" className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">My Orders</span>
            </Link>
            <Link href="/rentals" className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">My Rentals</span>
            </Link>
            <Link href="/saved" className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Saved Items</span>
            </Link>
            {user.isVendorApproved && (
              <Link href="/vendor/dashboard" className="flex flex-col items-center gap-2 p-4 border border-primary/30 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all group">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Vendor Dashboard</span>
              </Link>
            )}
            {!user.isVendorApproved && (
              <Link href="/vendor/onboarding" className="flex flex-col items-center gap-2 p-4 border border-dashed border-primary/40 rounded-xl hover:bg-primary/5 transition-all group">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Become a Vendor</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
