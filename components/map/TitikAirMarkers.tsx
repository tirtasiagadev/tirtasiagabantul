'use client'

import { memo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { Navigation } from 'lucide-react'
import Link from 'next/link'
import type { TitikAir } from '@/types/database'
import { customIcon, locationIcon } from '@/lib/map-utils'

interface TitikAirMarkersProps {
  titikAir: TitikAir[];
  userLocation: [number, number] | null;
  markerRefs: React.MutableRefObject<{ [key: string]: any }>;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

// Memoized Markers component to isolate re-renders
export const TitikAirMarkers = memo(({ 
  titikAir, 
  userLocation, 
  markerRefs, 
  getDistance 
}: TitikAirMarkersProps) => {
  return (
    <>
      {titikAir.map((titik: TitikAir) => (
        titik.latitude && titik.longitude ? (
          <Marker
            key={titik.id}
            position={[titik.latitude, titik.longitude]}
            icon={customIcon}
            ref={(ref) => {
              if (ref) markerRefs.current[titik.id] = ref
            }}
          >
            <Popup>
              <div className="flex flex-col p-0.5 min-w-[220px]">
                <div className="flex flex-col mb-2.5">
                  <h3 className="font-bold text-[15px] leading-tight text-slate-800 mb-0.5">{titik.nama_sumber_air}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{titik.alamat}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
                    <Navigation className="w-3 h-3" />
                    {userLocation ? `${getDistance(userLocation[0], userLocation[1], titik.latitude, titik.longitude).toFixed(2)} km dari Anda` : 'Aktifkan lokasi'}
                  </div>
                </div>

                {titik.foto_lokasi && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={titik.foto_lokasi}
                    alt={titik.nama_sumber_air}
                    className="w-full h-28 object-cover rounded-lg mb-3 border border-slate-100"
                  />
                )}

                <Link
                  href={`/asset/${titik.id}`}
                  className="block w-full bg-blue-600 !text-white text-xs font-semibold text-center py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Lihat Detail
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
      {userLocation && (
        <Marker position={userLocation} icon={locationIcon}>
          <Popup>Lokasi Anda Saat Ini</Popup>
        </Marker>
      )}
    </>
  );
});

TitikAirMarkers.displayName = 'TitikAirMarkers';
