'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TitikAir } from '@/types/database'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Upload, MapPin, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (fileToUpload) {
      const url = URL.createObjectURL(fileToUpload)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [fileToUpload])

  const [inputLat, setInputLat] = useState<string>('');
  const [inputLng, setInputLng] = useState<string>('');

  useEffect(() => {
    if (formData.latitude !== null && formData.latitude !== undefined) {
      if (parseFloat(inputLat) !== formData.latitude) {
        setInputLat(formData.latitude.toString());
      }
    } else {
      setInputLat('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.latitude]);

  useEffect(() => {
    if (formData.longitude !== null && formData.longitude !== undefined) {
      if (parseFloat(inputLng) !== formData.longitude) {
        setInputLng(formData.longitude.toString());
      }
    } else {
      setInputLng('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.longitude]);

  const handleManualLatChange = (val: string) => {
    setInputLat(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setFormData(prev => ({...prev, latitude: num}));
    } else if (val === '' || val === '-') {
      setFormData(prev => ({...prev, latitude: null}));
    }
  };

  const handleManualLngChange = (val: string) => {
    setInputLng(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setFormData(prev => ({...prev, longitude: num}));
    } else if (val === '' || val === '-') {
      setFormData(prev => ({...prev, longitude: null}));
    }
  };
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
        const img = new window.Image()
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

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Foto Lokasi</label>
                
                {/* Image Preview Area */}
                <div className="relative w-full h-48 sm:h-56 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden group flex items-center justify-center">
                  {(previewUrl || formData.foto_lokasi) ? (
                    <>
                      <Image 
                        src={previewUrl || formData.foto_lokasi || ''} 
                        alt="Preview lokasi" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white font-medium px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">Ganti Foto</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 pointer-events-none">
                      <Upload className="w-8 h-8 opacity-50" />
                      <span className="text-sm font-medium">Belum ada foto</span>
                    </div>
                  )}
                  
                  {/* Invisible file input that covers the preview box so clicking anywhere triggers upload */}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileToUpload(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    title="Klik untuk memilih foto"
                  />
                  
                  {/* Remove Photo Button */}
                  {(previewUrl || formData.foto_lokasi) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFileToUpload(null);
                        setPreviewUrl(null);
                        setFormData({...formData, foto_lokasi: null});
                      }}
                      className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 text-red-600 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 backdrop-blur-sm transition pointer-events-auto"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {fileToUpload && (
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Siap diupload: {fileToUpload.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="w-5 h-5 text-red-500" />
                Pilih Titik Lokasi Peta (Bisa diklik di peta atau masukkan manual)
              </label>
              <div className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-medium inline-block w-fit">
                {formData.latitude ? `${formData.latitude.toFixed(5)}, ${formData.longitude?.toFixed(5)}` : 'Belum Dipilih'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Latitude</label>
                <input 
                  type="text" 
                  value={inputLat}
                  onChange={e => handleManualLatChange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400 text-sm"
                  placeholder="Contoh: -7.8860"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Longitude</label>
                <input 
                  type="text" 
                  value={inputLng}
                  onChange={e => handleManualLngChange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400 text-sm"
                  placeholder="Contoh: 110.3298"
                />
              </div>
            </div>
            
            {/* Hanya render LocationPicker setelah inisialisasi / untuk mencegah layout shift jika initialLoc ada nilainya */}
            {(isNew || initialLoc !== null) && (
              <LocationPickerWithNoSSR 
                key={initialLoc ? `${initialLoc[0]}-${initialLoc[1]}` : 'new-loc'}
                onChange={handleLocationChange} 
                initialLocation={initialLoc} 
                positionValue={formData.latitude !== null && formData.latitude !== undefined && formData.longitude !== null && formData.longitude !== undefined ? [formData.latitude, formData.longitude] : null}
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
