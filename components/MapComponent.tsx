'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { TitikAir } from '@/types/database'
import Link from 'next/link'
import { Navigation, Locate } from 'lucide-react'

// Fix default icon issue with Leaflet in React
const customIcon = new L.Icon({
  iconUrl: '/icon/titikair.svg',
  iconRetinaUrl: '/icon/titikair.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// For current location marker
const locationIcon = new L.Icon({
  iconUrl: '/icon/user.svg',
  iconRetinaUrl: '/icon/user.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// For POS marker
const posIcon = new L.Icon({
  iconUrl: '/icon/pos.svg',
  iconRetinaUrl: '/icon/pos.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

export default function MapComponent() {
  const [titikAir, setTitikAir] = useState<TitikAir[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wmkData, setWmkData] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sungaiData, setSungaiData] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [titikData, setTitikData] = useState<any>(null)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  useEffect(() => {
    async function fetchTitik() {
      try {
        const { data } = await supabase.from('titik_air').select('*')
        if (data) setTitikAir(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchTitik()

    async function fetchGeoData() {
      try {
        const [wmkRes, sungaiRes, titikRes] = await Promise.all([
          fetch('/data/WMK_Sektor_Per_Kalurahan.geojson'),
          fetch('/data/Sungai.geojson'),
          fetch('/data/Titik_Sektor.geojson')
        ]);
        setWmkData(await wmkRes.json());
        setSungaiData(await sungaiRes.json());
        setTitikData(await titikRes.json());
      } catch (err) {
        console.error('Failed to load geojson', err)
      }
    }
    fetchGeoData()

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      })
    }
  }, [])

  const findNearest = () => {
    if (!userLocation || titikAir.length === 0) return;

    let nearest: TitikAir | null = null;
    let minDistance = Infinity;

    titikAir.forEach(titik => {
      if (titik.latitude && titik.longitude) {
        const dist = getDistance(userLocation[0], userLocation[1], titik.latitude, titik.longitude)
        if (dist < minDistance) {
          minDistance = dist;
          nearest = titik;
        }
      }
    })

    const nearestTitik = nearest as TitikAir | null;
    if (nearestTitik && nearestTitik.latitude && nearestTitik.longitude) {
      setFocusLocation([nearestTitik.latitude, nearestTitik.longitude]);
      const marker = markerRefs.current[nearestTitik.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1500)
      }
    } else {
      alert("Tidak ada titik air yang ditemukan.")
    }
  }

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setFocusLocation(loc);
        },
        () => {
          alert("Gagal mendapatkan lokasi. Pastikan izin akses lokasi diizinkan di browser Anda.");
        }
      );
    } else {
      alert("Browser Anda tidak mendukung fitur geolokasi.");
    }
  };

  const wmkStyle = {
    color: '#00ac95ff',
    weight: 2,
    fillColor: '#00ac95ff',
    fillOpacity: 0.2,
  };

  const sungaiStyle = {
    color: '#3b82f6',
    weight: 3,
    fillColor: '#93c5fd',
    fillOpacity: 0.4,
  };

  const pointToLayer = (feature: unknown, latlng: L.LatLng) => {
    return L.marker(latlng, { icon: posIcon });
  };

  const onEachFeatureWmk = (feature: { properties?: { DESA?: string; KECAMATAN?: string } }, layer: L.Layer) => {
    if (feature.properties && feature.properties.DESA) {
      layer.bindTooltip(feature.properties.DESA, {
        permanent: false,
        direction: 'center',
        className: 'bg-white bg-opacity-90 px-4 py-2 rounded shadow-md text-base uppercase font-semibold'
      });
    } else if (feature.properties && feature.properties.KECAMATAN) {
      layer.bindTooltip(feature.properties.KECAMATAN, {
        permanent: false,
        direction: 'center',
      });
    }
  };

  const onEachFeatureSungai = (feature: { properties?: { KETERANGAN?: string } }, layer: L.Layer) => {
    if (feature.properties && feature.properties.KETERANGAN) {
      layer.bindTooltip(feature.properties.KETERANGAN, {
        permanent: false,
        direction: 'center',
        className: 'bg-white bg-opacity-90 px-2 py-1 rounded shadow-s text-sm uppercase font-semibold text-blue-600'
      });
    }
  };

  const onEachFeatureTitik = (feature: { properties?: { Nama?: string; POS?: string } }, layer: L.Layer) => {
    if (feature.properties && feature.properties.Nama && feature.properties.POS) {
      layer.bindTooltip(`<b>${feature.properties.Nama}</b><br/>${feature.properties.POS}`, {
        permanent: false,
        direction: 'top',
        className: 'bg-white bg-opacity-90 px-6 py-4 m-4 rounded shadow-md text-sm'
      });
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      <MapContainer
        center={[-7.8860, 110.3298]}
        zoom={12}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapController center={focusLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
        />

        <LayersControl position="topright">
          {wmkData && (
            <LayersControl.Overlay name="WMK Sektor Per Kalurahan" checked>
              <GeoJSON data={wmkData} style={wmkStyle} onEachFeature={onEachFeatureWmk} />
            </LayersControl.Overlay>
          )}

          {sungaiData && (
            <LayersControl.Overlay name="Sungai" checked>
              <GeoJSON data={sungaiData} style={sungaiStyle} onEachFeature={onEachFeatureSungai} />
            </LayersControl.Overlay>
          )}

          {titikData && (
            <LayersControl.Overlay name="Titik Sektor" checked>
              <GeoJSON data={titikData} pointToLayer={pointToLayer} onEachFeature={onEachFeatureTitik} />
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {titikAir.map((titik) => (
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
                      {userLocation && titik.latitude && titik.longitude ? `${getDistance(userLocation[0], userLocation[1], titik.latitude, titik.longitude).toFixed(2)} km dari Anda` : 'Aktifkan lokasi'}
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
      </MapContainer>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3 items-end">
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-2 pointer-events-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legenda Peta</p>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/user.svg" alt="Lokasi Anda" className="w-5 h-5 drop-shadow-sm" />
            <span className="text-xs font-semibold text-slate-700">Lokasi Anda</span>
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/titikair.svg" alt="Sumber Air" className="w-5 h-5 drop-shadow-sm" />
            <span className="text-xs font-semibold text-slate-700">Sumber Air</span>
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon/pos.svg" alt="Pos Sektor" className="w-5 h-5 drop-shadow-sm" />
            <span className="text-xs font-semibold text-slate-700">Pos Sektor</span>
          </div>
        </div>

        <button
          onClick={handleLocateMe}
          className="bg-white text-slate-700 hover:text-blue-600 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium transition transform hover:scale-105"
        >
          <Locate className="w-5 h-5" />
          Lokasi Saya
        </button>
        {userLocation && (
          <button
            onClick={findNearest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium transition transform hover:scale-105"
          >
            <Navigation className="w-5 h-5" />
            Cari Titik Air Terdekat
          </button>
        )}
      </div>
    </div>
  )
}
