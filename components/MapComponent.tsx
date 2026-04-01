'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { TitikAir } from '@/types/database'
import { Navigation, Locate, ChevronDown, Map as MapIcon } from 'lucide-react'
import { getDistance, posIcon, sektorColors } from '@/lib/map-utils'

// Modular imports
import { MapController } from './map/MapController'

// Lazy load heavy map layers to minimize main thread blocking
const GeoJsonLayers = dynamic(() => import('./map/GeoJsonLayers').then(m => m.GeoJsonLayers), { 
  ssr: false 
})
const TitikAirMarkers = dynamic(() => import('./map/TitikAirMarkers').then(m => m.TitikAirMarkers), { 
  ssr: false 
})

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
  
  const [legendOpen, setLegendOpen] = useState(false)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  // Initial data fetch
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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      })
    }
  }, [])

  // Optimized GeoJSON loading with Web Worker offloading
  useEffect(() => {
    const loadGeoWithWorker = () => {
      const worker = new Worker('/workers/geojson-worker.js');
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          const { titik, sungai, wmk } = e.data.data;
          // Set each state individually to keep rendering tasks split
          if (titik) setTitikData(titik);
          if (sungai) setSungaiData(sungai);
          if (wmk) setWmkData(wmk);
        } else {
          console.error('Worker failed to load GeoJSON:', e.data.error);
        }
        worker.terminate();
      };

      worker.postMessage({
        urls: {
          titik: '/data/Titik_Sektor.geojson',
          sungai: '/data/Sungai.geojson',
          wmk: '/data/WMK_Sektor_Per_Kalurahan.geojson'
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGeoWithWorker, { timeout: 3000 });
    } else {
      setTimeout(loadGeoWithWorker, 1000);
    }
  }, [])

  const findNearest = () => {
    if (!userLocation || titikAir.length === 0) return;

    let nearest: TitikAir | null = null;
    let minDistance = Infinity;

    for (const titik of titikAir) {
      if (titik.latitude && titik.longitude) {
        const dist = getDistance(userLocation[0], userLocation[1], titik.latitude, titik.longitude)
        if (dist < minDistance) {
          minDistance = dist;
          nearest = titik;
        }
      }
    }

    if (nearest && nearest.latitude && nearest.longitude) {
      setFocusLocation([nearest.latitude, nearest.longitude]);
      const marker = markerRefs.current[nearest.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1500)
      }
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
        () => alert("Gagal mendapatkan lokasi.")
      );
    }
  };

  // Memoized style and event functions moved inside to capture state/refs correctly if needed,
  // but kept stable with dependencies to prevent INP lag.
  const wmkStyle = useCallback((feature: any) => {
    const sektor = feature?.properties?.Sektor || '';
    const color = sektorColors[sektor] || '#00ac95';
    return { color, weight: 2, fillColor: color, fillOpacity: 0.25 };
  }, []);

  const sungaiStyle = useMemo(() => ({
    color: '#3b82f6', weight: 3, fillColor: '#93c5fd', fillOpacity: 0.4,
  }), []);

  const pointToLayer = useCallback((_f: any, latlng: L.LatLng) => {
    return L.marker(latlng, { icon: posIcon });
  }, []);

  const onEachFeatureWmk = useCallback((feature: any, layer: L.Layer) => {
    const desa = feature.properties?.DESA || '';
    const sektor = feature.properties?.Sektor || '';
    const color = sektorColors[sektor] || '#00ac95';
    if (desa) {
      layer.bindTooltip(
        `<div style="text-align:center;"><span style="font-weight:700;font-size:13px;">${desa}</span><br/><span style="color:${color};font-weight:600;font-size:11px;">Sektor ${sektor}</span></div>`,
        { permanent: false, direction: 'center', className: 'bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md' }
      );
    }
  }, []);

  const onEachFeatureSungai = useCallback((feature: any, layer: L.Layer) => {
    if (feature.properties?.KETERANGAN) {
      layer.bindTooltip(feature.properties.KETERANGAN, {
        permanent: false, direction: 'center', className: 'bg-white bg-opacity-90 px-2 py-1 rounded shadow-s text-sm uppercase font-semibold text-blue-600'
      });
    }
  }, []);

  const onEachFeatureTitik = useCallback((feature: any, layer: L.Layer) => {
    if (feature.properties?.Nama && feature.properties?.POS) {
      layer.bindTooltip(`<b>${feature.properties.Nama}</b><br/>${feature.properties.POS}`, {
        permanent: false, direction: 'top', className: 'bg-white bg-opacity-90 px-6 py-4 m-4 rounded shadow-md text-sm'
      });
    }
  }, []);

  // Isolate MapContainer from parent state updates (like legend toggling)
  const mapContent = useMemo(() => (
    <MapContainer
      center={[-7.8860, 110.3298]}
      zoom={12}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={true}
    >
      <MapController center={focusLocation} />
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
      />

      <GeoJsonLayers
        wmkData={wmkData}
        sungaiData={sungaiData}
        titikData={titikData}
        wmkStyle={wmkStyle}
        sungaiStyle={sungaiStyle}
        pointToLayer={pointToLayer}
        onEachFeatureWmk={onEachFeatureWmk}
        onEachFeatureSungai={onEachFeatureSungai}
        onEachFeatureTitik={onEachFeatureTitik}
      />

      <TitikAirMarkers
        titikAir={titikAir}
        userLocation={userLocation}
        markerRefs={markerRefs as any}
        getDistance={getDistance}
      />
    </MapContainer>
  ), [focusLocation, wmkData, sungaiData, titikData, wmkStyle, sungaiStyle, pointToLayer, onEachFeatureWmk, onEachFeatureSungai, onEachFeatureTitik, titikAir, userLocation]);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      {mapContent}
      
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2 items-end">
        {/* Collapsible Legend */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className="bg-white/95 backdrop-blur-sm w-9 h-9 rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition"
          >
            {legendOpen ? <ChevronDown className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
          </button>
          {legendOpen && (
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1.5 mt-2 max-h-[50vh] overflow-y-auto w-[160px]">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Legenda</p>
              {[
                { label: 'Lokasi Anda', icon: '/icon/user.svg' },
                { label: 'Sumber Air', icon: '/icon/titikair.svg' },
                { label: 'Pos Sektor', icon: '/icon/pos.svg' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <img src={item.icon} alt={item.label} className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 my-0.5" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sektor WMK</p>
              {Object.entries(sektorColors).map(([sektor, color]) => (
                <div key={sektor} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-medium text-slate-600">{sektor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLocateMe}
          className="bg-white w-9 h-9 rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition hover:scale-105"
        >
          <Locate className="w-4 h-4" />
        </button>
        {userLocation && (
          <button
            onClick={findNearest}
            className="bg-blue-600 hover:bg-blue-700 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-white transition hover:scale-105"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
