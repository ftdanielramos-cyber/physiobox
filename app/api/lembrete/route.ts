import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || '')
    const { clienteNome, data, horaInicio, horaFim, tipo, notas } = await req.json()

    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-PT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    const { data: result, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ftdanielramos@gmail.com',
      subject: `Lembrete de Sessão — ${clienteNome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 12px;">
          <h1 style="font-size: 22px; font-weight: 800; color: #111; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 8px;">
            Lembrete de Sessão
          </h1>
          <p style="font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
            PhysioBox
          </p>

          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Cliente</p>
            <p style="font-size: 18px; font-weight: 700; color: #111; margin: 0;">${clienteNome}</p>
          </div>

          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Data</p>
            <p style="font-size: 16px; font-weight: 700; color: #111; margin: 0; text-transform: capitalize;">${dataFormatada}</p>
          </div>

          ${horaInicio ? `
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Hora</p>
            <p style="font-size: 16px; font-weight: 700; color: #111; margin: 0;">
              ${horaInicio.slice(0, 5)}${horaFim ? ` → ${horaFim.slice(0, 5)}` : ''}
            </p>
          </div>
          ` : ''}

          ${tipo ? `
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Tipo</p>
            <p style="font-size: 16px; font-weight: 700; color: #111; margin: 0; text-transform: uppercase;">${tipo}</p>
          </div>
          ` : ''}

          ${notas ? `
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Notas</p>
            <p style="font-size: 14px; color: #555; margin: 0;">${notas}</p>
          </div>
          ` : ''}

          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 24px;">
            Enviado via PhysioBox · physiobox.vercel.app
          </p>
        </div>
      `,
    })

    if (error) return NextResponse.json({ error }, { status: 400 })
    return NextResponse.json({ success: true, id: result?.id })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}