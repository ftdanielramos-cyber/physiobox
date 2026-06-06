'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

// ... (mantém os teus types Cliente e Sessao aqui)

export default function FichaClientePage() {
  const params = useParams()
  const router = useRouter()
  
  // A correção está aqui: se params.id falhar, tentamos extrair da URL manualmente
  const [id, setId] = useState<string | null>(null)
  
  useEffect(() => {
    const idCapturado = params?.id || params?.cliente_id || params?.id_cliente || window.location.pathname.split('/')[2];
    setId(idCapturado as string);
  }, [params]);

  const [cliente, setCliente] = useState<any>(null)
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [erroFatal, setErroFatal] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (id) {
      carregarDados();
    } else if (id === undefined) {
      // Aguarda um pouco para o params carregar
    } else {
      setErroFatal("ID DO CLIENTE NÃO ENCONTRADO NA URL.");
      setLoading(false);
    }
  }, [id]);

  async function carregarDados() {
    if (!id) return;
    try {
      setLoading(true)
      const { data: dadosCliente, error: errCliente } = await supabase
        .from('clientes')
        .select('*')
        .or(`id.eq.${id},cliente_id.eq.${id},id_cliente.eq.${id}`)
        .maybeSingle()
      
      if (errCliente || !dadosCliente) {
        setErroFatal(`CLIENTE NÃO ENCONTRADO (ID: ${id})`)
        return
      }

      setCliente(dadosCliente)
      const idRealDoCliente = dadosCliente.id || dadosCliente.cliente_id || dadosCliente.id_cliente

      const { data: dadosSessoes } = await supabase
        .from('sessoes')
        .select('*')
        .eq('cliente_id', idRealDoCliente)

      setSessoes(dadosSessoes || [])
    } catch (e) {
      setErroFatal("ERRO AO LIGAR À BASE DE DADOS")
    } finally {
      setLoading(false)
    }
  }

  // ... (mantém o resto das tuas funções criarNovaSessao, formatarData e o JSX exatamente como estavam)
  // Certifica-te apenas que fechas a função e o export default corretamente
}