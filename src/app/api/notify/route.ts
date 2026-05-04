import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { studentName, studentEmail, studentPhone, price, paymentMethod, discountApplied } = await req.json()

  // Guardar inscripción en Supabase
  const { error: dbError } = await supabase
    .from('belly_dance_registrations')
    .insert({
      full_name: studentName,
      email: studentEmail,
      phone: studentPhone || null,
      payment_method: paymentMethod,
      discount_code: discountApplied ? 'chechebelly' : null,
      amount_paid: price,
      payment_status: 'pending',
    })

  if (dbError) {
    console.error('Error guardando inscripción:', dbError.message)
    // No bloqueamos el flujo — los emails se mandan igual
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  // Email al admin
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: 'chechestudiomx@gmail.com',
    subject: '🌙 Nueva inscripción Belly Dance',
    html: `
      <h2>Nueva inscripción a Belly Dance</h2>
      <p><b>Alumna:</b> ${studentName}</p>
      <p><b>Correo:</b> ${studentEmail}</p>
      <p><b>Teléfono:</b> ${studentPhone || 'no proporcionado'}</p>
      <p><b>Precio:</b> $${price} MXN ${discountApplied ? '(código early bird)' : ''}</p>
      <p><b>Método de pago:</b> ${paymentMethod}</p>
      <p><b>Clases:</b> Sábados 11:30am — 1:00pm · Mayo 2025</p>
    `,
  })

  // Email a la alumna
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: studentEmail,
    subject: '🌙 ¡Tu reserva en Belly Dance está confirmada!',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#c084fc;">¡Bienvenida a Belly Dance!</h2>
        <p>Hola ${studentName}, tu inscripción está confirmada. 💜</p>
        <div style="background:#f9f0ff;border-radius:10px;padding:16px;margin:16px 0;">
          <p>🗓 <b>Sábados 11:30am — 1:00pm</b></p>
          <p>📍 <b>Che' Che' Studio</b><br/>Av. Cuauhtémoc 1233, col. Santa Cruz Atoyac, Benito Juárez, CDMX</p>
          <p>💜 <b>4 clases · 30 días de vigencia</b></p>
          <p>💰 <b>$${price} MXN</b> · ${paymentMethod}</p>
        </div>
        ${paymentMethod === 'transfer' ? '<p style="color:#d97706;">⚠️ Recuerda enviar tu comprobante de transferencia por WhatsApp al +52 55 7988 1048</p>' : ''}
        ${paymentMethod === 'cash' ? '<p style="color:#d97706;">⚠️ Recuerda pagar en efectivo el día de tu primera clase.</p>' : ''}
        <p>¿Dudas? Escríbenos por WhatsApp: <a href="https://wa.me/525579881048">+52 55 7988 1048</a></p>
        <p style="color:#888;font-size:12px;">Che' Che' Studio · chechestudiomx@gmail.com</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
