'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

// ─── DEFINIÇÃO DOS 3 MODELOS ───────────────────────────────────────────────

type TipoCampo = 'numero' | 'opcoes' | 'texto' | 'bilateral' | 'tempo'
type Campo = {
  id: string
  label: string
  tipo: TipoCampo
  unidade?: string
  opcoes?: string[]
  instrucao?: string
  referencia?: string
}
type Secao = { titulo: string; descricao?: string; campos: Campo[] }
type ModeloConfig = { id: number; nome: string; cor: string; secoes: Secao[] }

const MODELOS_CONFIG: ModeloConfig[] = [
  {
    id: 1,
    nome: 'Avaliacao Funcional Base',
    cor: '#3b82f6',
    secoes: [
      {
        titulo: 'Anamnese Rapida',
        campos: [
          { id: 'objetivo', label: 'Objetivo Principal', tipo: 'opcoes', opcoes: ['Perda de peso', 'Ganho de massa', 'Reabilitacao', 'Saude geral', 'Desporto', 'Outro'] },
          { id: 'atividade_atual', label: 'Atividade Fisica Atual', tipo: 'opcoes', opcoes: ['Sedentario', 'Levemente ativo (1-2x/semana)', 'Moderadamente ativo (3-4x/semana)', 'Muito ativo (5+x/semana)'] },
          { id: 'dor_atual', label: 'Dor ou Desconforto Atual', tipo: 'opcoes', opcoes: ['Sem dor', 'Dor leve (1-3)', 'Dor moderada (4-6)', 'Dor intensa (7-10)'] },
          { id: 'zona_dor', label: 'Zona de Dor (se aplicavel)', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Medidas Antropometricas',
        campos: [
          { id: 'peso', label: 'Peso', tipo: 'numero', unidade: 'kg' },
          { id: 'altura', label: 'Altura', tipo: 'numero', unidade: 'cm' },
          { id: 'perimetro_abdominal', label: 'Perimetro Abdominal', tipo: 'numero', unidade: 'cm', instrucao: 'Ao nivel do umbigo, em expiração' },
        ],
      },
      {
        titulo: 'Postura Estatica',
        descricao: 'Observacao visual em posicao anatomica — vista anterior, lateral e posterior.',
        campos: [
          { id: 'postura_cabeca', label: 'Posicao da Cabeca', tipo: 'opcoes', opcoes: ['Neutra', 'Protracao (anteriorizada)', 'Inclinacao lateral D', 'Inclinacao lateral E'] },
          { id: 'postura_ombros', label: 'Ombros', tipo: 'opcoes', opcoes: ['Simetricos', 'Ombro D elevado', 'Ombro E elevado', 'Protracao bilateral', 'Protracao D', 'Protracao E'] },
          { id: 'postura_coluna', label: 'Coluna (perfil)', tipo: 'opcoes', opcoes: ['Alinhamento normal', 'Hiperlordose lombar', 'Hipercifose toracica', 'Retificacao lombar', 'Escoliose observada'] },
          { id: 'postura_joelhos', label: 'Joelhos (frontal)', tipo: 'opcoes', opcoes: ['Neutros', 'Valgo bilateral', 'Varo bilateral', 'Valgo D', 'Varo D', 'Valgo E', 'Varo E'] },
          { id: 'postura_obs', label: 'Observacoes Posturais', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Equilibrio Unipodal',
        descricao: 'Teste de Romberg modificado. Descalco, maos nas ancas. 3 tentativas cada lado, registar melhor resultado.',
        campos: [
          { id: 'eq_dir_olhos_abertos', label: 'Direito — Olhos Abertos', tipo: 'tempo', unidade: 's', referencia: 'Referencia: >30s (adulto jovem), >20s (>50 anos)' },
          { id: 'eq_esq_olhos_abertos', label: 'Esquerdo — Olhos Abertos', tipo: 'tempo', unidade: 's' },
          { id: 'eq_dir_olhos_fechados', label: 'Direito — Olhos Fechados', tipo: 'tempo', unidade: 's', referencia: 'Referencia: >10s' },
          { id: 'eq_esq_olhos_fechados', label: 'Esquerdo — Olhos Fechados', tipo: 'tempo', unidade: 's' },
        ],
      },
      {
        titulo: 'Sit-to-Stand 30 Segundos',
        descricao: 'Cadeira sem apoio de bracos (altura ~43cm). Contar o numero de vezes que se levanta completamente em 30 segundos.',
        campos: [
          { id: 'sts_resultado', label: 'Numero de Repeticoes', tipo: 'numero', unidade: 'reps', referencia: 'Ref: 60-64 anos: H≥14 / M≥12 | 65-69: H≥12 / M≥11 | 70-74: H≥12 / M≥10' },
          { id: 'sts_obs', label: 'Observacoes (compensacoes, uso de bracos)', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Flexibilidade — Sit & Reach',
        descricao: 'Sentado no chao, pernas estendidas, pés contra a caixa (ou fita a 0cm). Deslizar as maos para a frente sem flectir os joelhos. Melhor de 3 tentativas.',
        campos: [
          { id: 'sit_reach', label: 'Distancia Alcancada', tipo: 'numero', unidade: 'cm', referencia: 'Ref adulto: Bom >20cm H / >25cm M. Valores negativos = antes dos pés.' },
        ],
      },
      {
        titulo: 'Marcha Observacional',
        descricao: 'Observar 10m de marcha a ritmo natural — ida e volta.',
        campos: [
          { id: 'marcha_cadencia', label: 'Cadencia Percebida', tipo: 'opcoes', opcoes: ['Normal', 'Lenta', 'Rapida/irregular'] },
          { id: 'marcha_simetria', label: 'Simetria', tipo: 'opcoes', opcoes: ['Simetrica', 'Assimetria leve D', 'Assimetria leve E', 'Assimetria marcada D', 'Assimetria marcada E'] },
          { id: 'marcha_obs', label: 'Observacoes', tipo: 'texto' },
        ],
      },
      { titulo: 'Conclusao', campos: [{ id: 'conclusao', label: 'Conclusao e Recomendacoes', tipo: 'texto' }] },
    ],
  },

  {
    id: 2,
    nome: 'Avaliacao Funcional Intermedia',
    cor: '#a855f7',
    secoes: [
      {
        titulo: 'Overhead Squat (OHS)',
        descricao: 'Pes a largura dos ombros, bracos extendidos acima da cabeca. 5 repeticoes a ritmo controlado. Observar de frente e de lado.',
        campos: [
          { id: 'ohs_joelhos', label: 'Joelhos', tipo: 'opcoes', opcoes: ['Neutros (passa a linha do 2 dedo)', 'Valgo bilateral', 'Valgo D', 'Valgo E', 'Varo'] },
          { id: 'ohs_tronco', label: 'Inclinacao do Tronco', tipo: 'opcoes', opcoes: ['Neutra (<45 graus)', 'Inclinacao excessiva anterior', 'Inclinacao lateral D', 'Inclinacao lateral E'] },
          { id: 'ohs_lombar', label: 'Lombar na Descida', tipo: 'opcoes', opcoes: ['Neutra', 'Flexao (butt wink)', 'Extensao excessiva'] },
          { id: 'ohs_calcanhares', label: 'Calcanhares', tipo: 'opcoes', opcoes: ['No chao', 'Elevam ligeiramente', 'Elevam marcadamente'] },
          { id: 'ohs_obs', label: 'Observacoes', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Single Leg Squat (SLS)',
        descricao: 'Pes juntos, elevar um pe, descer ~45 graus no membro de apoio. 5 repeticoes cada lado. Observar de frente.',
        campos: [
          { id: 'sls_dir', label: 'Membro Direito', tipo: 'opcoes', opcoes: ['Sem compensacao', 'Valgo do joelho', 'Inclinacao lateral do tronco', 'Multiplas compensacoes', 'Nao consegue realizar'] },
          { id: 'sls_esq', label: 'Membro Esquerdo', tipo: 'opcoes', opcoes: ['Sem compensacao', 'Valgo do joelho', 'Inclinacao lateral do tronco', 'Multiplas compensacoes', 'Nao consegue realizar'] },
          { id: 'sls_obs', label: 'Observacoes', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Push-Up Test',
        descricao: 'Posicao de prancha (ou joelhos para populacao menos treinada). Descer o peito ate ~5cm do chao. Contar maximo de repeticoes sem perda de forma.',
        campos: [
          { id: 'pushup_tipo', label: 'Variante Utilizada', tipo: 'opcoes', opcoes: ['Push-up completo (pés)', 'Push-up modificado (joelhos)'] },
          { id: 'pushup_reps', label: 'Numero de Repeticoes', tipo: 'numero', unidade: 'reps', referencia: 'Ref homem 30-39: Bom 17-21 | Ref mulher 30-39: Bom 13-19' },
          { id: 'pushup_obs', label: 'Observacoes (forma, escáfula, lombar)', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Plank Estatico (Core)',
        descricao: 'Posicao de prancha em antebracos. Manter posicao neutra da coluna. Registar tempo ate falha de forma.',
        campos: [
          { id: 'plank_tempo', label: 'Tempo Maximo', tipo: 'tempo', unidade: 's', referencia: 'Ref: >60s adequado | >120s bom | >180s excelente' },
          { id: 'plank_obs', label: 'Observacoes (compensacoes)', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Shoulder Mobility (FMS)',
        descricao: 'Punhos fechados com polegar dentro. Deslizar um punho pelo dorso ate ao limite. Medir distancia entre punhos. 3 tentativas cada lado, melhor resultado.',
        campos: [
          { id: 'sm_dir', label: 'Direito (mao em cima)', tipo: 'numero', unidade: 'cm', referencia: 'FMS: 3 pts = punhos sobrepostos | 2 pts = distancia < comprimento mao | 1 pt = > comprimento mao | 0 = dor' },
          { id: 'sm_esq', label: 'Esquerdo (mao em cima)', tipo: 'numero', unidade: 'cm' },
          { id: 'sm_dor', label: 'Dor durante o teste', tipo: 'opcoes', opcoes: ['Sem dor', 'Dor ligeira D', 'Dor ligeira E', 'Dor moderada D', 'Dor moderada E'] },
        ],
      },
      {
        titulo: 'Mobilidade do Quadril — Thomas Test',
        descricao: 'Deitado em supino na ponta da mesa/banco. Abracar um joelho ao peito, observar o membro contralateral.',
        campos: [
          { id: 'thomas_dir', label: 'Flexor da Anca Direita', tipo: 'opcoes', opcoes: ['Flexivel (coxa toca na mesa)', 'Encurtamento leve (coxa levanta ligeiramente)', 'Encurtamento moderado', 'Encurtamento marcado'] },
          { id: 'thomas_esq', label: 'Flexor da Anca Esquerda', tipo: 'opcoes', opcoes: ['Flexivel (coxa toca na mesa)', 'Encurtamento leve (coxa levanta ligeiramente)', 'Encurtamento moderado', 'Encurtamento marcado'] },
        ],
      },
      {
        titulo: 'Forcometria Isometrica — Forca de Prensao',
        descricao: 'Dinamometro manual. Posicao de pe, braco ao lado do corpo, cotovelo a 0 graus. 3 tentativas cada mao, intervalo 60s. Melhor resultado.',
        campos: [
          { id: 'grip_dir', label: 'Mao Dominante', tipo: 'numero', unidade: 'kg', referencia: 'Ref homem 30-39: >50kg | Mulher 30-39: >32kg' },
          { id: 'grip_esq', label: 'Mao Nao Dominante', tipo: 'numero', unidade: 'kg' },
        ],
      },
      { titulo: 'Conclusao', campos: [{ id: 'conclusao', label: 'Conclusao, Limitacoes e Objetivos', tipo: 'texto' }] },
    ],
  },

  {
    id: 3,
    nome: 'Avaliacao Funcional Avancada',
    cor: '#10b981',
    secoes: [
      {
        titulo: 'Forca de Prensao (Grip Strength)',
        descricao: 'Dinamometro manual. 3 tentativas cada mao, intervalo 60s. Melhor resultado.',
        campos: [
          { id: 'grip_dom', label: 'Mao Dominante', tipo: 'numero', unidade: 'kg', referencia: 'Ref homem 20-29: >56kg | Mulher 20-29: >36kg' },
          { id: 'grip_ndom', label: 'Mao Nao Dominante', tipo: 'numero', unidade: 'kg' },
        ],
      },
      {
        titulo: 'Salto Vertical — CMJ (Countermovement Jump)',
        descricao: 'Pes a largura dos ombros, maos nas ancas. Flexao rapida seguida de salto maximo. Medir com fita/app ou diferenca de alcance (standing reach vs. salto). Melhor de 3 tentativas.',
        campos: [
          { id: 'cmj_altura', label: 'Altura do Salto', tipo: 'numero', unidade: 'cm', referencia: 'Ref homem 20-29: Bom >50cm | Mulher 20-29: Bom >35cm' },
          { id: 'cmj_obs', label: 'Observacoes (assimetria, tecnica)', tipo: 'texto' },
        ],
      },
      {
        titulo: 'T-Test de Agilidade',
        descricao: 'Cones em T: cone A (inicio), B (5m frente), C e D (2.5m para cada lado de B). Correr A→B (frente), B→C (lateral), C→D (lateral oposto), D→B (lateral), B→A (retroceder). Cronometrar. Melhor de 2 tentativas.',
        campos: [
          { id: 'ttest_t1', label: 'Tentativa 1', tipo: 'tempo', unidade: 's' },
          { id: 'ttest_t2', label: 'Tentativa 2', tipo: 'tempo', unidade: 's', referencia: 'Ref homem: Excelente <9.5s | Bom <10.5s | Ref mulher: Excelente <10.5s | Bom <11.5s' },
          { id: 'ttest_obs', label: 'Observacoes', tipo: 'texto' },
        ],
      },
      {
        titulo: 'YYIRT Nivel 1 (Yo-Yo Intermittent Recovery Test)',
        descricao: 'Distancia: 20m shuttle run com periodos de recuperacao de 10s. Iniciar com audio (app disponivel). Registar o nivel e a distancia total percorrida quando o atleta falha 2x.',
        campos: [
          { id: 'yyirt_nivel', label: 'Nivel Atingido', tipo: 'texto' },
          { id: 'yyirt_distancia', label: 'Distancia Total', tipo: 'numero', unidade: 'm', referencia: 'Ref homem adulto ativo: >1000m | Atleta: >2000m' },
          { id: 'yyirt_fc_max', label: 'FC Maxima Registada', tipo: 'numero', unidade: 'bpm' },
        ],
      },
      {
        titulo: 'VO2max Estimado — Teste de Marcha de 6 Minutos (6MWT)',
        descricao: 'Percurso de 30m (vai-e-vem). Caminhar o mais depressa possivel durante 6 minutos. Registar distancia total. Formula: VO2max = (0.0235 x distancia) - (0.3080 x idade) - (0.1822 x peso) + (2.4 x sexo[H=1,M=0]) + 14.786',
        campos: [
          { id: 'seis_min_distancia', label: 'Distancia Percorrida', tipo: 'numero', unidade: 'm', referencia: 'Ref adulto saudavel 40-49 anos: >540m H / >480m M' },
          { id: 'seis_min_fc_final', label: 'FC no Final', tipo: 'numero', unidade: 'bpm' },
          { id: 'seis_min_vo2max', label: 'VO2max Estimado (calcular)', tipo: 'numero', unidade: 'ml/kg/min', referencia: 'Ref adulto 40-49: Bom H>39 / M>34 | Excelente H>48 / M>42' },
        ],
      },
      {
        titulo: 'Reactividade — Drop Jump (opcional)',
        descricao: 'Saltar de uma caixa de 30cm, aterrar e ressaltar imediatamente. Medir altura de ressalto e tempo de contacto com app (My Jump, etc). Calcular RSI = altura / tempo de contacto.',
        campos: [
          { id: 'dj_altura', label: 'Altura do Ressalto', tipo: 'numero', unidade: 'cm' },
          { id: 'dj_contacto', label: 'Tempo de Contacto', tipo: 'numero', unidade: 'ms', referencia: 'RSI bom: >1.5 | Excelente: >2.0' },
          { id: 'dj_rsi', label: 'RSI Calculado', tipo: 'numero', unidade: '' },
        ],
      },
      { titulo: 'Conclusao', campos: [{ id: 'conclusao', label: 'Analise, Limitacoes e Programacao', tipo: 'texto' }] },
    ],
  },
]

// ─── COMPONENTE ────────────────────────────────────────────────────────────

export default function ModeloPage() {
  const params = useParams()
  const router = useRouter()
  const rawClienteId = params?.clienteId
  const rawModeloId = params?.modeloId
  const clienteId = Array.isArray(rawClienteId) ? rawClienteId[0] : rawClienteId as string
  const modeloIdNum = parseInt(Array.isArray(rawModeloId) ? rawModeloId[0] : rawModeloId as string)

  const [cliente, setCliente] = useState<{ nome: string } | null>(null)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [secaoAtiva, setSecaoAtiva] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const supabase = createClient()

  const modelo = MODELOS_CONFIG.find(m => m.id === modeloIdNum)

  useEffect(() => {
    if (!clienteId) return
    supabase.from('clientes').select('nome').eq('id', clienteId).single().then(({ data }) => setCliente(data))
  }, [clienteId])

  function setResposta(campoId: string, valor: string) {
    setRespostas(prev => ({ ...prev, [campoId]: valor }))
  }

  async function guardar() {
    if (!modelo) return
    setGuardando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('user:', user?.id, 'clienteId:', clienteId)
      const { data, error } = await supabase.from('avaliacoes').insert({
        cliente_id: clienteId,
        fisio_id: user?.id,
        modelo: modelo.nome,
        respostas: respostas,
        data: new Date().toISOString().split('T')[0],
      })
      console.log('resultado:', data, 'erro:', error)
      if (error) { alert('Erro: ' + error.message); setGuardando(false); return }
      router.push(`/clientes/${clienteId}`)
    } catch (e) {
      console.log('catch:', e)
      alert('Erro ao guardar avaliacao.')
    }
    setGuardando(false)
  }

  if (!modelo) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444', fontSize: '11px', textTransform: 'uppercase' }}>Modelo nao encontrado.</p>
    </main>
  )

  const secao = modelo.secoes[secaoAtiva]
  const totalSecoes = modelo.secoes.length
  const progresso = Math.round(((secaoAtiva) / totalSecoes) * 100)

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 120px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: modelo.cor, background: `${modelo.cor}18`, border: `1px solid ${modelo.cor}30`, borderRadius: '20px', padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Modelo {modeloIdNum}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '4px' }}>{modelo.nome}</h1>
          {cliente && <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cliente.nome}</p>}
        </div>

        {/* Barra de progresso */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secao {secaoAtiva + 1} de {totalSecoes}</span>
            <span style={{ fontSize: '9px', color: modelo.cor, fontWeight: 700 }}>{progresso}%</span>
          </div>
          <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progresso}%`, background: modelo.cor, borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          {/* Dots de navegação */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' as const }}>
            {modelo.secoes.map((s, i) => (
              <button key={i} onClick={() => setSecaoAtiva(i)}
                style={{ height: '6px', borderRadius: '3px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: i === secaoAtiva ? modelo.cor : i < secaoAtiva ? `${modelo.cor}50` : '#1e1e1e', width: i === secaoAtiva ? '24px' : '6px' }} />
            ))}
          </div>
        </div>

        {/* Secao atual */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '9px', color: modelo.cor, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '6px' }}>Secao {secaoAtiva + 1}</p>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: secao.descricao ? '10px' : '20px' }}>{secao.titulo}</h2>
          {secao.descricao && (
            <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>{secao.descricao}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {secao.campos.map(campo => (
              <div key={campo.id}>
                <label style={{ display: 'block', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '6px' }}>
                  {campo.label}
                  {campo.unidade && <span style={{ color: '#444', marginLeft: '4px' }}>({campo.unidade})</span>}
                </label>
                {campo.instrucao && <p style={{ fontSize: '10px', color: '#555', marginBottom: '8px', fontStyle: 'italic' }}>{campo.instrucao}</p>}

                {campo.tipo === 'opcoes' && campo.opcoes && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {campo.opcoes.map(op => (
                      <button key={op} onClick={() => setResposta(campo.id, op)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: respostas[campo.id] === op ? `${modelo.cor}15` : '#0d0d0d', border: respostas[campo.id] === op ? `1px solid ${modelo.cor}50` : '1px solid #1e1e1e', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `2px solid ${respostas[campo.id] === op ? modelo.cor : '#333'}`, background: respostas[campo.id] === op ? modelo.cor : 'transparent', flexShrink: 0, transition: 'all 0.1s' }} />
                        <span style={{ fontSize: '12px', color: respostas[campo.id] === op ? '#fff' : '#666', fontWeight: respostas[campo.id] === op ? 700 : 400 }}>{op}</span>
                      </button>
                    ))}
                  </div>
                )}

                {(campo.tipo === 'numero' || campo.tipo === 'tempo') && (
                  <input
                    type="number"
                    value={respostas[campo.id] || ''}
                    onChange={e => setResposta(campo.id, e.target.value)}
                    placeholder={campo.tipo === 'tempo' ? 'segundos' : campo.unidade || ''}
                    style={{ width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: '#fff', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                )}

                {campo.tipo === 'texto' && (
                  <textarea
                    value={respostas[campo.id] || ''}
                    onChange={e => setResposta(campo.id, e.target.value)}
                    rows={campo.id === 'conclusao' ? 5 : 3}
                    style={{ width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#fff', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
                  />
                )}

                {campo.referencia && (
                  <p style={{ fontSize: '9px', color: '#3b82f6', marginTop: '6px', lineHeight: 1.5, fontStyle: 'italic' }}>📊 {campo.referencia}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navegação entre secoes */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {secaoAtiva > 0 && (
            <button onClick={() => setSecaoAtiva(s => s - 1)}
              style={{ flex: 1, background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', cursor: 'pointer' }}>
              ← Anterior
            </button>
          )}
          {secaoAtiva < totalSecoes - 1 ? (
            <button onClick={() => setSecaoAtiva(s => s + 1)}
              style={{ flex: 2, background: modelo.cor, border: 'none', borderRadius: '14px', padding: '14px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fff', cursor: 'pointer' }}>
              Proximo →
            </button>
          ) : (
            <button onClick={guardar} disabled={guardando}
              style={{ flex: 2, background: '#16a34a', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fff', cursor: 'pointer', opacity: guardando ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {guardando ? 'A guardar...' : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  Concluir Avaliacao
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}