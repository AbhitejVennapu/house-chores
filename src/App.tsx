import { useState, type ReactElement } from 'react'
import { useChoreStore } from './hooks/useChoreStore'
import { Dashboard } from './components/Dashboard'
import { ChoresManager } from './components/ChoresManager'
import { History } from './components/History'
import { Settings } from './components/Settings'
import { ChoresIcon, HistoryIcon, SettingsIcon, TodayIcon } from './components/icons'

type Tab = 'today' | 'chores' | 'history' | 'settings'

const TABS: { id: Tab; label: string; icon: () => ReactElement }[] = [
  { id: 'today', label: 'Today', icon: TodayIcon },
  { id: 'chores', label: 'Chores', icon: ChoresIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

interface Props {
  householdId: string
  userId: string
}

export function App({ householdId, userId }: Props) {
  const store = useChoreStore(householdId, userId)
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="hc-screen">
      <main>
        {store.error && <p className="hc-error">{store.error}</p>}
        {store.loading ? (
          <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <div className="hc-skeleton" />
            <div className="hc-skeleton" />
          </div>
        ) : (
          <>
            {tab === 'today' && <Dashboard store={store} />}
            {tab === 'chores' && <ChoresManager store={store} />}
            {tab === 'history' && <History store={store} />}
            {tab === 'settings' && <Settings store={store} householdId={householdId} />}
          </>
        )}
      </main>

      {store.toast && (
        <div className="hc-toast" role="status">
          <span className="hc-toast-msg">{store.toast.choreName} marked done</span>
          <button type="button" className="hc-toast-action" onClick={store.undoToast}>
            Undo
          </button>
        </div>
      )}

      <nav className="hc-tabbar" aria-label="Sections">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className="hc-tabbar-item"
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => setTab(t.id)}
            >
              <span className="hc-tabbar-icon">
                <Icon />
              </span>
              {t.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
