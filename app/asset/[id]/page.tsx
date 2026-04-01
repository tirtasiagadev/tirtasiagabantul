import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { MapPin, Navigation, Droplets, Ruler, Maximize } from 'lucide-react'
import Image from 'next/image'

export default async function DetaiAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const { data: titikAir } = await supabase
    .from('titik_air')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!titikAir) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center p-20 text-gray-500">Asset tidak ditemukan</div>
      </div>
    )
  }

  const mapLink = `https://www.google.com/maps?q=${titikAir.latitude},${titikAir.longitude}`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="w-full h-64 sm:h-80 md:h-[400px] relative bg-slate-200">
            {titikAir.foto_lokasi ? (
              <Image 
                src={titikAir.foto_lokasi} 
                alt={titikAir.nama_sumber_air}
                className="w-full h-full object-cover"
                width={800}
                height={600}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                <Droplets className="w-12 h-12" />
                <span>Tanpa Foto</span>
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Titik Air
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                {titikAir.nama_sumber_air}
              </h1>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <p className="leading-relaxed">{titikAir.alamat}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <Maximize className="w-8 h-8 text-blue-500 bg-blue-100 p-1.5 rounded-lg" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Volume Air</p>
                  <p className="font-semibold text-slate-900">{titikAir.volume_air || 'Volume Tidak Diketahui'}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <Ruler className="w-8 h-8 text-teal-500 bg-teal-100 p-1.5 rounded-lg" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Lebar Jalan</p>
                  <p className="font-semibold text-slate-900">{titikAir.akses_jalan_lebar || '-'}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <Navigation className="w-8 h-8 text-indigo-500 bg-indigo-100 p-1.5 rounded-lg" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Struktur Jalan</p>
                  <p className="font-semibold text-slate-900">{titikAir.akses_jalan_struktur || '-'}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-orange-500 bg-orange-100 p-1.5 rounded-lg" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Koordinat Lokasi</p>
                  <p className="font-semibold text-slate-900 text-sm">{titikAir.latitude}, {titikAir.longitude}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <a 
                href={mapLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Navigation className="w-5 h-5" />
                Buka di Google Maps
              </a>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
