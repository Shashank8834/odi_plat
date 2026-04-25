import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 overflow-auto"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, rgba(34, 211, 238, 0.04) 0%, #060e1a 50%)',
        }}
      >
        <div className="p-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
