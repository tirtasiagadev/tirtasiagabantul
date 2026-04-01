'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TitikAir } from '@/types/database'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Upload, MapPin } from 'lucide-react'
import Link from 'next/link'

const LocationPickerWithNoSSR = dynamic(
  () => import('@/components/LocationPicker'),
  { ssr: false }
)

export default function FormTitikAir(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const isNew = params.id === 'new'
  const router = useRouter()
  
  const [formData, setFormData] = useState<Partial<TitikAir>>({
    nama_sumber_air: '',
    alamat: '',
    volume_air: '',
    akses_jalan_lebar: '',
    akses_jalan_struktur: '',
    latitude: null,
    longitude: null,
    foto_lokasi: null
  })
  
  const [loading, setLoading] = useState(false)
  const [initialLoc, setInitialLoc] = useState<[number, number] | null>(null)
  
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  useEffect(() => {
    if (!isNew) {
      async function fetchTitik() {
        const { data } = await supabase.from('titik_air').select('*').eq('id', params.id).single()
        if (data) {
          setFormData(data)
          if (data.latitude && data.longitude) {
            setInitialLoc([data.latitude, data.longitude])
          }
        }
      }
      fetchTitik()
    }
  }, [params.id, isNew])

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
  }, [])

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const scaleSize = MAX_WIDTH / img.width
          canvas.width = MAX_WIDTH
          canvas.height = img.height * scaleSize
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }))
            } else {
              resolve(file)
            }
          }, 'image/jpeg', 0.7)
        }
      }
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    let photoUrl = formData.foto_lokasi
    
    // Upload image to Supabase storage if exists
    if (fileToUpload) {
      const compressedFile = await compressImage(fileToUpload)
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(`public/${fileName}`, compressedFile)
        
      if (!error && data) {
        const { data: publicUrl } = supabase.storage
          .from('photos')
          .getPublicUrl(data.path)
        photoUrl = publicUrl.publicUrl
      }
    }

    const payload = { ...formData, foto_lokasi: photoUrl }
    
    if (isNew) {
      const { error } = await supabase.from('titik_air').insert([payload])
      if (!error) router.push('/admin/dashboard')
    } else {
      const { error } = await supabase.from('titik_air').update(payload).eq('id', params.id)
      if (!error) router.push('/admin/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-16 bg-white shadow-sm px-4 sm:px-6 flex items-center gap-4 border-b border-slate-100">
        <Link href="/admin/dashboard" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="font-bold text-lg text-slate-800 tracking-tight">
          {isNew ? 'Tambah Titik Air' : 'Edit Titik Air'}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Nama Sumber Air</label>
                <input 
                  required
                  type="text" 
                  value={formData.nama_sumber_air}
                  onChange={e => setFormData({...formData, nama_sumber_air: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                  placeholder="Contoh: Mata Air Kasihan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.alamat}
                  onChange={e => setFormData({...formData, alamat: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
                  placeholder="Jl. Raya Bantul No. 12"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Volume Air</label>
                <input 
                  type="text" 
                  value={formData.volume_air || ''}
                  onChange={e => setFormData({...formData, volume_air: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                  placeholder="Contoh: 100 Liter/detik"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Akses Lebar Jalan (opsional)</label>
                <input 
                  type="text" 
                  value={formData.akses_jalan_lebar || ''}
                  onChange={e => setFormData({...formData, akses_jalan_lebar: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                  placeholder="Contoh: 3 Meter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Struktur Jalan (opsional)</label>
                <input 
                  type="text" 
                  value={formData.akses_jalan_struktur || ''}
                  onChange={e => setFormData({...formData, akses_jalan_struktur: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                  placeholder="Contoh: Aspal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Foto Lokasi</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition border border-blue-100 font-semibold w-full text-center">
                    <Upload className="w-5 h-5" />
                    Upload Foto Baru (Dioptimasi)
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileToUpload(e.target.files[0])
                        }
                      }}
                      className="hidden" 
                    />
                  </label>
                </div>
                {fileToUpload && <p className="text-sm font-medium text-slate-700 mt-2">Siap diupload: <span className="text-slate-500">{fileToUpload.name}</span></p>}
                {!fileToUpload && formData.foto_lokasi && (
                  <p className="text-sm font-medium text-slate-500 mt-2 truncate max-w-[200px] sm:max-w-xs" title={formData.foto_lokasi}>Foto saat ini: {formData.foto_lokasi}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="w-5 h-5 text-red-500" />
                Pilih Titik Lokasi Peta
              </label>
              <div className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-medium inline-block w-fit">
                {formData.latitude ? `${formData.latitude.toFixed(5)}, ${formData.longitude?.toFixed(5)}` : 'Belum Dipilih'}
              </div>
            </div>
            
            {/* Hanya render LocationPicker setelah inisialisasi / untuk mencegah layout shift jika initialLoc ada nilainya */}
            {(isNew || initialLoc !== null) && (
              <LocationPickerWithNoSSR 
                key={initialLoc ? `${initialLoc[0]}-${initialLoc[1]}` : 'new-loc'}
                onChange={handleLocationChange} 
                initialLocation={initialLoc} 
              />
            )}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
            <button 
              type="submit" 
              disabled={loading || (!formData.latitude && !isNew)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
