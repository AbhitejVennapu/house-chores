import { useState } from 'react'
import { useChoreStore } from './hooks/useChoreStore'
import { Dashboard } from './components/Dashboard'
import { ChoresManager } from './components/ChoresManager'
import { History } from './components/History'
import { Settings } from './components/Settings'

type Tab = 'dashboard' | 'chores' | 'history' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'chores', label: 'Chores' },
  { id: 'history', label: 'History' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const store = useChoreStore()
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header>
        <h1>House Chores</h1>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(t => (
            <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'dashboard' && <Dashboard store={store} />}
        {tab === 'chores' && <ChoresManager store={store} />}
        {tab === 'history' && <History store={store} />}
        {tab === 'settings' && <Settings store={store} />}
      </main>
    </div>
  )
}
