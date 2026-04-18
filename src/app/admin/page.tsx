'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

const navItems = ['Dashboard', 'Clases', 'Maestras', 'Alumnos', 'Espacios', 'Pagos', 'Contenido']

export default function AdminPage() {
  const [active, setActive] = useState('Dashboard')
  const [stats, setStats] = useState({ alumnos: 0, clases: 0 })
  const [classTypes, setClassTypes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [{ count: alumnosCount }, { data: tipos }, { data: alumnos }] = await Promise.all([
      getSupabase().from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      getSupabase().from('class_types').select('*').eq('is_active', true).order('name'),
      getSupabase().from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }).limit(20),
    ])
    setStats({ alumnos: alumnosCount || 0, clases: tipos?.length || 0 })
    setClassTypes(tipos || [])
    setStudents(alumnos || [])
    setLoading(false)
  }

  const categoryColor: Record<string, string> = {
    yoga: '#1D9E75', barre: '#e94560', hipopresivos: '#378ADD',
    stretch: '#D4537E', fitness: '#BA7517'
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', minHeight: '100vh', color: 'white', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', background: '#1a1a2e', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>FitSpace MX</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', marginTop: '2px' }}>ADMIN CONSOLE</div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => (
            <div key={item} onClick={() => setActive(item)} style={{
              padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
              fontSize: '13px', cursor: 'pointer',
              background: active === item ? 'rgba(233,69,96,0.18)' : 'transparent',
              color: active === item ? '#e94560' : 'rgba(255,255,255,0.55)'
            }}>{item}</div>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>A</div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Admin</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>FitSpace MX</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '52px', background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 500 }}>{active}</div>
          <button style={{ background: '#e94560', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Nueva clase</button>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Cargando datos...
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {active === 'Dashboard' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Alumnos registrados', value: stats.alumnos.toLocaleString() },
                      { label: 'Tipos de clase', value: stats.clases.toString() },
                      { label: 'Ingresos históricos', value: '$2.8M' },
                      { label: 'Órdenes totales', value: '3,625' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 500 }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px' }}>Datos reales de Fitune</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>Tipos de clase activos</div>
                      {classTypes.slice(0, 8).map(ct => (
                        <div key={ct.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColor[ct.category] || '#888', flexShrink: 0 }}></div>
                          <div style={{ flex: 1, fontSize: '13px' }}>{ct.name}</div>
                          <div style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>{ct.category}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>Últimas alumnas registradas</div>
                      {students.slice(0, 8).map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0 }}>
                            {s.full_name?.charAt(0) || '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{s.full_name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* CLASES */}
              {active === 'Clases' && (
                <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Tipos de clase ({classTypes.length})</span>
                    <button style={{ background: '#e94560', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>+ Nueva</button>
                  </div>
                  {classTypes.map(ct => (
                    <div key={ct.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: categoryColor[ct.category] || '#888', flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{ct.name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{ct.duration_mins} min · {ct.category}</div>
                      </div>
                      <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: ct.is_active ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.08)', color: ct.is_active ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                        {ct.is_active ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ALUMNOS */}
              {active === 'Alumnos' && (
                <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>
                    Alumnas ({stats.alumnos.toLocaleString()} total) — mostrando últimas 20
                  </div>
                  {students.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                        {s.full_name?.charAt(0) || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.full_name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(s.created_at).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>alumna</div>
                    </div>
                  ))}
                </div>
              )}

              {/* OTROS */}
              {!['Dashboard', 'Clases', 'Alumnos'].includes(active) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>🚧</div>
                  <div style={{ fontSize: '15px', fontWeight: 500 }}>Módulo {active}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Próximamente</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
