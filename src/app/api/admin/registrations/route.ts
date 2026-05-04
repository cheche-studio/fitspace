import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('belly_dance_registrations')
    .select(`
      id,
      created_at,
      full_name,
      email,
      phone,
      payment_method,
      discount_code,
      amount_paid,
      payment_status,
      notes
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ registrations: data })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, payment_status, notes } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (payment_status !== undefined) updateData.payment_status = payment_status
  if (notes !== undefined) updateData.notes = notes
  if (payment_status === 'confirmed') updateData.confirmed_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('belly_dance_registrations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ registration: data })
}
