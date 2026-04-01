'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { Locate } from 'lucide-react'

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

const customIcon = new L.Icon({
  iconUrl: '/icon/titikair.svg',
  iconRetinaUrl: '/icon/titikair.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Lokasi Dipilih</Popup>
    </Marker>
  )
}

export default function LocationPicker({ onChange, initialLocation }: { onChange: (lat: number, lng: number) => void, initialLocation: [number, number] | null }) {
  const [position, setPosition] = useState<[number, number] | null>(initialLocation)
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wmkData, setWmkData] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sungaiData, setSungaiData] = useState<any>(null)

  useEffect(() => {
    if (position) {
      onChange(position[0], position[1])
    }
  }, [position, onChange])

  useEffect(() => {
    async function fetchGeoData() {
      try {
        const [wmkRes, sungaiRes] = await Promise.all([
          fetch('/data/WMK_Sektor_Per_Kalurahan.geojson'),
          fetch('/data/Sungai.geojson')
        ]);
        setWmkData(await wmkRes.json());
        setSungaiData(await sungaiRes.json());
      } catch (err) {
        console.error('Failed to load geo data', err);
      }
    }
    fetchGeoData();
  }, []);

  const wmkStyle = {
    color: '#00ac95',
    weight: 2,
    fillColor: '#00ac95',
    fillOpacity: 0.2,
  };

  const onEachFeatureWmk = (feature: { properties?: { DESA?: string } }, layer: L.Layer) => {
    if (feature.properties && feature.properties.DESA) {
      layer.bindTooltip(feature.properties.DESA, {
        permanent: true,
        direction: 'center',
        className: '!bg-transparent !border-none !shadow-none !text-white font-bold text-[10px] sm:text-xs uppercase !p-0'
      });
    }
  };

  const sungaiStyle = {
    color: '#3b82f6',
    weight: 3,
    fillColor: '#93c5fd',
    fillOpacity: 0.4,
  };

  const onEachFeatureSungai = (feature: { properties?: { KETERANGAN?: string } }, layer: L.Layer) => {
    if (feature.properties && feature.properties.KETERANGAN) {
      layer.bindTooltip(feature.properties.KETERANGAN, {
        permanent: false,
        direction: 'center',
        className: 'bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm text-sm uppercase font-semibold text-blue-600'
      });
    }
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setFocusLocation([lat, lng]);
      }, () => {
        alert("Gagal mendapatkan lokasi. Pastikan izin akses lokasi diizinkan di browser Anda.");
      });
    } else {
      alert("Browser Anda tidak mendukung fitur ini.");
    }
  };

  return (
    <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0">
      <MapContainer
        center={initialLocation || [-7.8860, 110.3298]}
        zoom={12}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapController center={focusLocation} />
        <TileLayer
          attribution='&copy; Google Maps'
          url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
        />
        {wmkData && (
          <GeoJSON data={wmkData} style={wmkStyle} onEachFeature={onEachFeatureWmk} />
        )}
        {sungaiData && (
          <GeoJSON data={sungaiData} style={sungaiStyle} onEachFeature={onEachFeatureSungai} />
        )}
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <button
        type="button"
        onClick={handleLocateMe}
        className="absolute bottom-12 right-12 z-[1000] bg-white p-2.5 rounded-lg shadow-md hover:bg-slate-50 transition border border-slate-200 flex items-center justify-center text-blue-600"
        title="Gunakan Lokasi Saat Ini"
      >
        <Locate className="w-5 h-5" />
      </button>
    </div>
  )
}
