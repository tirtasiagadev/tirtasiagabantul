'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TitikAir } from '@/types/database'
import Link from 'next/link'
import { Plus, Edit2, Trash2, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/actions/authActions'

export default function AdminDashboard() {
  const [titikAir, setTitikAir] = useState<TitikAir[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTitik = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('titik_air').select('*').order('created_at', { ascending: false })
      if (data) setTitikAir(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTitik()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Ingin menghapus titik air ini?")) {
      const { error } = await supabase.from('titik_air').delete().eq('id', id)
      if (!error) {
        fetchTitik()
      } else {
        alert("Gagal menghapus.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-16 bg-white shadow-sm px-4 sm:px-6 flex items-center justify-between border-b border-slate-100">
        <div className="font-bold text-lg text-slate-800 tracking-tight">Admin Dashboard</div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">Lihat Peta</Link>
          <button onClick={() => logoutAction()} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 transition px-2 py-1.5 rounded-md hover:bg-slate-50">
            <LogOut className="w-4 h-4"/>
            Keluar
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Titik Air</h1>
          <Link 
            href="/admin/form/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Nama Sumber Air</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold">Alamat</th>
                  <th className="hidden md:table-cell px-6 py-4 font-semibold">Koordinat</th>
                  <th className="px-4 sm:px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent align-[[-0.125em]]" />
                    </td>
                  </tr>
                ) : titikAir.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500 font-medium">Belum ada data titik air.</td>
                  </tr>
                ) : (
                  titikAir.map((titik) => (
                    <tr key={titik.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 whitespace-normal">
                        {titik.nama_sumber_air}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-normal min-w-[200px] text-sm text-slate-600">
                        {titik.alamat}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                        {titik.latitude?.toFixed(4)}, {titik.longitude?.toFixed(4)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/form/${titik.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(titik.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
