'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function FichaSimples() {
  const params = useParams()
  const id = params?.id
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const supabase = createClient()
      const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      setData(cliente)
    }
    fetchData()
  }, [id])

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Debug de Ficha</h1>
      <p>ID na URL: <strong>{id}</strong></p>
      <hr />
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>A carregar ou sem dados no Supabase para este ID...</p>
      )}
    </div>
  )
}