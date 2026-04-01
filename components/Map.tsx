'use client'

import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
)

export default function Map() {
  return <MapWithNoSSR />
}
