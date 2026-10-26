import { useState, type ChangeEvent } from 'react'
import type { ChoreStore } from '../hooks/useChoreStore'
import { isAppData } from '../storage/localStore'
import { todayISO } from '../lib/dates'

export function Settings({ store }: { store: ChoreStore }) {
  const { data, replaceData } = store
  const [message, setMessage] = useState<string | null>(null)

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `house-chores-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isAppData(parsed)) throw new Error('This file is not a House Chores backup.')
      if (!confirm('Replace all current chores and history with this backup?')) return
      replaceData(parsed)
      setMessage('Backup imported.')
    } catch (error) {
      setMessage(`Import failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  }

  return (
    <section className="card form">
      <h2>Backup</h2>
      <p className="muted">
        Data is stored in this browser only. Export a backup regularly, and use it to move data to another device.
      </p>
      <div className="actions">
        <button className="primary" onClick={exportBackup}>
          Export JSON
        </button>
        <label className="file-button">
          Import JSON
          <input type="file" accept="application/json,.json" onChange={importBackup} hidden />
        </label>
      </div>
      {message && <p>{message}</p>}
    </section>
  )
}
