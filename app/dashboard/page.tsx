'use client'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Physiobox</h1>

        <div className="grid grid-cols-2 gap-4">
          <a href="/clientes" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">👥</div>
            <h2 className="font-medium text-gray-800">Clientes</h2>
            <p className="text-sm text-gray-500">Gerir clientes</p>
          </a>
          <a href="/calendario" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">📅</div>
            <h2 className="font-medium text-gray-800">Calendário</h2>
            <p className="text-sm text-gray-500">Ver sessões</p>
          </a>
        </div>
      </div>
    </main>
  )
}