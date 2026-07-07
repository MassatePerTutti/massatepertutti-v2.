import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Dumbbell, Users, ClipboardList, Brain, LogOut } from 'lucide-react'
import { supabase } from './supabaseClient'
import './styles.css'

function AuthBox({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const action = mode === 'login'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

      const { data, error } = await action
      if (error) throw error

      if (mode === 'signup' && data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, email })
        setMessage('Account creato. Controlla la mail se Supabase richiede conferma.')
      }
      onAuth?.()
    } catch (err) {
      setMessage(err.message || 'Errore di autenticazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card" id="account">
      <h2>{mode === 'login' ? 'Accedi' : 'Crea account'}</h2>
      <p>Area riservata per contenuti, sessioni, scouting e materiali tecnici.</p>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
        <button disabled={loading}>{loading ? 'Attendere...' : mode === 'login' ? 'Entra' : 'Registrati'}</button>
      </form>
      <button className="link-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
      {message && <p className="message">{message}</p>}
    </section>
  )
}

function Dashboard({ user, onLogout }) {
  return (
    <section className="dashboard">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h2>Benvenuto nell’area MassatePerTutti</h2>
        <p>Utente collegato: {user.email}</p>
      </div>
      <button className="secondary" onClick={onLogout}><LogOut size={18}/> Esci</button>
      <div className="dashboard-grid">
        <div><h3>Contenuti</h3><p>Articoli, appunti, video e materiali formativi.</p></div>
        <div><h3>Sessioni coaching</h3><p>Prenotazioni, storico attività e note operative.</p></div>
        <div><h3>Scouting</h3><p>Analisi, schede e report progressivi.</p></div>
      </div>
    </section>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user || null)
    setLoading(false)
  }

  useEffect(() => {
    refreshUser()
    const { data: listener } = supabase.auth.onAuthStateChange(() => refreshUser())
    return () => listener.subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return <div className="loading">Caricamento...</div>

  return (
    <main>
      <header className="hero">
        <nav>
          <strong>MassatePerTutti</strong>
          <a href="#account">Crea account</a>
        </nav>
        <div className="hero-content">
          <p className="eyebrow">Basket • Coaching • Contenuti</p>
          <h1>La piattaforma operativa per allenarsi, crescere e condividere metodo.</h1>
          <p>Un sito dinamico per community, materiali tecnici, sessioni, scouting e contenuti riservati.</p>
          <a className="cta" href="#account">Entra nella piattaforma</a>
        </div>
      </header>

      <section className="features">
        <article><Dumbbell/><h3>Allenamenti</h3><p>Programmi, progressioni, esercizi e lavoro settimanale.</p></article>
        <article><ClipboardList/><h3>Scouting</h3><p>Report, schede giocatori e analisi partite.</p></article>
        <article><Users/><h3>Community</h3><p>Area utenti con accesso ai contenuti riservati.</p></article>
        <article><Brain/><h3>MassAI</h3><p>Sezione pronta per integrare un assistente dedicato.</p></article>
      </section>

      {user ? <Dashboard user={user} onLogout={logout} /> : <AuthBox onAuth={refreshUser} />}

      <footer>© MassatePerTutti</footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
