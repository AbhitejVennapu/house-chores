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

interface Props {
  householdId: string
  userId: string
}

export function App({ householdId, userId }: Props) {
  const store = useChoreStore(householdId, userId)
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="hc-app">
      <header className="hc-header">
        <h1 className="hc-title">House Chores</h1>
      </header>

      <main>
        {store.error && <p className="hc-error">{store.error}</p>}
        {store.loading ? (
          <div className="hc-list">
            <div className="hc-skeleton" />
            <div className="hc-skeleton" />
          </div>
        ) : (
          <>
            {tab === 'dashboard' && <Dashboard store={store} />}
            {tab === 'chores' && <ChoresManager store={store} />}
            {tab === 'history' && <History store={store} />}
            {tab === 'settings' && <Settings store={store} householdId={householdId} />}
          </>
        )}
      </main>

      {store.toast && (
        <div className="hc-toast" role="status">
          <span className="hc-toast-msg">{store.toast.choreName} marked done</span>
          <button className="hc-toast-action" onClick={store.undoToast}>
            Undo
          </button>
        </div>
      )}

      <nav className="hc-tabs" aria-label="Sections" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            className="hc-tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
