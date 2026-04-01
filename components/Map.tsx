'use client'

import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-64px)] w-full bg-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-slate-300" />
          <div className="h-3 w-32 bg-slate-300 rounded" />
          <div className="h-2 w-24 bg-slate-300/70 rounded" />
        </div>
      </div>
    ),
  }
)

export default function Map() {
  return <MapWithNoSSR />
}
