import Map from '@/components/Map'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 w-full bg-slate-200 relative">
        <Map />
      </div>
    </main>
  )
}
