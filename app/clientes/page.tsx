'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  data_nasc: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const supabase = createClient()

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function adicionarCliente(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('clientes').insert({
      nome, email, telefone, data_nasc: dataNasc || null,
      created_by: user?.id
    })
    setNome(''); setEmail(''); setTelefone(''); setDataNasc('')
    setMostrarForm(false)
    carregarClientes()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</a>
            <h1 className="text-2xl font-semibold text-gray-800 mt-1">Clientes</h1>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            + Novo cliente
          </button>
        </div>