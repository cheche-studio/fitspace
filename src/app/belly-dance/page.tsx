'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

const DISCOUNT_CODE = 'chechebelly'
const PRICE_REGULAR = 1250
const PRICE_EARLY_BIRD = 1060
const CLASS_CAPACITY = 12

const SCHEDULES = [
  { date: 'Sábado 3 de mayo', time: '11:30am — 1:00pm' },
  { date: 'Sábado 10 de mayo', time: '11:30am — 1:00pm' },
  { date: 'Sábado 17 de mayo', time: '11:30am — 1:00pm' },
  { date: 'Sábado 24 de mayo', time: '11:30am — 1:00pm' },
]

type View = 'landing' | 'login' | 'register' | 'booking' | 'success'

export default function BellyDancePage() {
  const [view, setView] = useState<View>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'transfer' | 'cash'>('stripe')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [spotsLeft, setSpotsLeft] = useState(CLASS_CAPACITY)

  const price = discountApplied ? PRICE_EARLY_BIRD : PRICE_REGULAR

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
        setView('booking')
      }
    })
    setSpotsLeft(8)
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos. ¿Eres nueva? Regístrate abajo.')
    } else {
      setUser(data.user)
      setView('booking')
    }
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Error al crear cuenta: ' + error.message)
    } else if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        role: 'student',
      })
      setUser(data.user)
      setView('booking')
    }
    setLoading(false)
  }

  function applyDiscount() {
    if (discountCode.toLowerCase() === DISCOUNT_CODE) {
      setDiscountApplied(true)
      setError('')
    } else {
      setError('Código inválido')
    }
  }

  async function handleBooking() {
    setLoading(true)
    setError('')
    const supabase = getSupabase()
    await supabase.from('suggestions').insert({
      student_id: user?.id,
      type: 'class',
      title: 'Belly Dance - Inscripción pendiente',
      body: `Método: ${paymentMethod} · Precio: $${price} · Código: ${discountApplied ? DISCOUNT_CODE : 'ninguno'}`,
    })
    setView('success')
    setLoading(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#0f0f1a', color: 'white', fontFamily: 'system-ui, sans-serif' },
    hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 20px', textAlign: 'center' as const },
    badge: { display: 'inline-block', background: 'rgba(192,132,252,0.2)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', marginBottom: '16px', letterSpacing: '1px' },
    h1: { fontSize: '36px', fontWeight: 700, marginBottom: '8px', color: 'white' },
    subtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' },
    card: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '440px', margin: '0 auto' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' as const },
    btn: { width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: '#c084fc', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' },
    btnOutline: { width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' },
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' },
    error: { color: '#f87171', fontSize: '12px', marginBottom: '10px', textAlign: 'center' as const },
    section: { padding: '40px 20px', maxWidth: '600px', margin: '0 auto' },
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.badge}>🌙 SOFT LAUNCH · MAYO 2025</div>
        <h1 style={s.h1}>Belly Dance — Danza Árabe</h1>
        <p style={s.subtitle}>Con Violeta Ruiseñor</p>
        <p style={s.subtitle}>Sábados 11:30am — 1:00pm</p>
        <p style={{ ...s.subtitle, fontSize: '13px', marginTop: '4px' }}>Che' Che' Studio · Av. Cuauhtémoc 1233, CDMX</p>
        <div style={{ marginTop: '20px', display: 'inline-block', background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '10px', padding: '10px 24px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginRight: '8px' }}>$1,250</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#c084fc' }}>$1,060</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>/ mes con código</span>
        </div>
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          {spotsLeft} lugares disponibles de {CLASS_CAPACITY}
        </div>
        {view === 'landing' && (
          <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <button onClick={() => setView('register')} style={{ ...s.btn, width: 'auto', padding: '12px 32px', fontSize: '14px', marginBottom: 0 }}>
              Inscribirme →
            </button>
            <button onClick={() => setView('login')} style={{ ...s.btnOutline, width: 'auto', padding: '12px 24px', fontSize: '14px' }}>
              Ya tengo cuenta
            </button>
          </div>
        )}
      </div>

      <div style={s.section}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#c084fc' }}>Clases de mayo</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {SCHEDULES.map((sc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{sc.date}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{sc.time}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
          💜 Mensualidad incluye 4 clases · Vigencia 30 días desde tu pago · Cupo máximo {CLASS_CAPACITY} personas
        </div>
      </div>

      <div style={{ padding: '0 20px 60px', maxWidth: '440px', margin: '0 auto' }}>

        {view === 'register' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Crear cuenta</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Tu correo será tu acceso al estudio</p>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>Nombre completo</label>
            <input style={s.input} placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
            <label style={s.label}>Correo electrónico</label>
            <input style={s.input} type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={s.btn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>
            <button style={s.btnOutline} onClick={() => setView('login')}>Ya tengo cuenta</button>
          </div>
        )}

        {view === 'login' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Iniciar sesión</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Entra con tu correo registrado</p>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>Correo electrónico</label>
            <input style={s.input} type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={s.btn} onClick={handleLogin} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
            <button style={s.btnOutline} onClick={() => setView('register')}>Crear cuenta nueva</button>
          </div>
        )}

        {view === 'booking' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Reservar mensualidad</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Belly Dance · Mayo 2025 · 4 clases</p>
            <label style={s.label}>Código de descuento (opcional)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input style={{ ...s.input, marginBottom: 0, flex: 1 }} placeholder="chechebelly" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
              <button onClick={applyDiscount} style={{ padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(192,132,252,0.4)', background: 'transparent', color: '#c084fc', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' as const }}>Aplicar</button>
            </div>
            {discountApplied && <div style={{ color: '#4ade80', fontSize: '12px', marginBottom: '12px' }}>✓ Código aplicado — precio early bird</div>}
            {error && <div style={s.error}>{error}</div>}
            <div style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Total a pagar</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#c084fc' }}>${price.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>MXN · 4 clases · 30 días vigencia</div>
            </div>
            <label style={s.label}>Método de pago</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'stripe', label: '💳 Tarjeta' },
                { id: 'transfer', label: '🏦 Transferencia' },
                { id: 'cash', label: '💵 Efectivo' },
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} style={{
                  padding: '10px 6px', borderRadius: '8px',
                  border: `1px solid ${paymentMethod === m.id ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                  background: paymentMethod === m.id ? 'rgba(192,132,252,0.15)' : 'transparent',
                  color: paymentMethod === m.id ? '#c084fc' : 'rgba(255,255,255,0.5)',
                  fontSize: '12px', cursor: 'pointer'
                }}>{m.label}</button>
              ))}
            </div>
            {paymentMethod === 'transfer' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
                🏦 <strong style={{ color: 'white' }}>Datos de transferencia:</strong><br/>
                Banco: Nu Bank<br/>
                CLABE: 638180000129674405<br/>
                Beneficiario: Violeta Ruiseñor<br/>
                <span style={{ color: '#facc15' }}>Envía tu comprobante por WhatsApp</span>
              </div>
            )}
            {paymentMethod === 'cash' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
                💵 Paga en efectivo el día de tu primera clase.<br/>
                <span style={{ color: '#facc15' }}>Tu lugar queda reservado al completar este formulario.</span>
              </div>
            )}
            <button style={s.btn} onClick={handleBooking} disabled={loading}>
              {loading ? 'Procesando...' : paymentMethod === 'stripe' ? 'Pagar con tarjeta →' : 'Confirmar reserva →'}
            </button>
          </div>
        )}

        {view === 'success' && (
          <div style={{ ...s.card, textAlign: 'center' as const }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>¡Reserva confirmada!</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', lineHeight: '1.6' }}>
              Nos vemos los sábados a las 11:30am en Che' Che' Studio.<br/>
              Av. Cuauhtémoc 1233, col. Santa Cruz Atoyac, CDMX.
            </p>
            <div style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
              🗓 4 clases · Sábados 11:30am — 1:00pm<br/>
              💜 Vigencia 30 días desde hoy<br/>
              📍 Av. Cuauhtémoc 1233, Benito Juárez
            </div>
            {paymentMethod !== 'stripe' && (
              <p style={{ fontSize: '13px', color: '#facc15', marginBottom: '16px' }}>
                {paymentMethod === 'transfer'
                  ? '⚠️ Recuerda enviar tu comprobante de transferencia por WhatsApp.'
                  : '⚠️ Recuerda pagar en efectivo el día de tu primera clase.'}
              </p>
            )}
            <button onClick={() => window.open('https://wa.me/525579881048', '_blank')} style={{ ...s.btn, background: '#25D366' }}>
              Contactar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
