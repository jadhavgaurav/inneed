'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import Link from 'next/link'
import { formatINR } from '@/lib/utils'

interface Listing {
  id: string
  title: string
  latitude?: number
  longitude?: number
  pricing?: {
    rentPriceDaily?: number | null
    buyPrice?: number | null
  }
}

interface ListingsMapProps {
  listings: Listing[]
  center?: { lat: number; lng: number }
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 } // India center
const MAP_CONTAINER_STYLE = { width: '100%', height: '500px' }

export default function ListingsMap({ listings, center }: ListingsMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [selected, setSelected] = useState<Listing | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), [])
  const onUnmount = useCallback(() => setMap(null), [])

  const mappablePins = listings.filter(l => l.latitude && l.longitude)

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-xl flex items-center justify-center text-center px-6">
        <div>
          <p className="font-medium text-muted-foreground">Map unavailable</p>
          <p className="text-sm text-muted-foreground mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to enable map view</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center || DEFAULT_CENTER}
      zoom={center ? 12 : 5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {mappablePins.map(listing => (
        <Marker
          key={listing.id}
          position={{ lat: listing.latitude!, lng: listing.longitude! }}
          onClick={() => setSelected(listing)}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="%237C3AED" stroke="white" stroke-width="2"/>
                <text x="18" y="22" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">₹</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(36, 36),
          }}
        />
      ))}

      {selected && selected.latitude && selected.longitude && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="max-w-[200px]">
            <p className="font-medium text-sm line-clamp-2 mb-1">{selected.title}</p>
            {selected.pricing?.rentPriceDaily && (
              <p className="text-primary text-xs font-semibold">{formatINR(selected.pricing.rentPriceDaily)}/day</p>
            )}
            <Link href={`/items/${selected.id}`} className="text-xs text-primary underline mt-1 block">
              View details →
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
