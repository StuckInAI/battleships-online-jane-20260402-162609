'use client'

import { AttackLogEntry } from '@/types/game'
import styles from './AttackLog.module.css'

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

interface AttackLogProps {
  log: AttackLogEntry[]
}

export default function AttackLog({ log }: AttackLogProps) {
  const formatPosition = (pos: { row: number; col: number }) =>
    `${COLS[pos.col]}${pos.row + 1}`

  const getResultColor = (result: string) => {
    switch (result) {
      case 'hit': return 'var(--accent-red)'
      case 'sunk': return 'var(--accent-orange)'
      case 'miss': return 'var(--grid-miss)'
      default: return 'var(--accent-green)'
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'hit': return '✕'
      case 'sunk': return '☠'
      case 'miss': return '•'
      default: return '?'
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>BATTLE LOG</div>
      <div className={styles.logList}>
        {log.length === 0 ? (
          <div className={styles.empty}>
            <span className="blink">AWAITING COMBAT...</span>
          </div>
        ) : (
          log.slice(0, 20).map((entry, idx) => (
            <div
              key={entry.timestamp + idx}
              className={`${styles.logEntry} ${idx === 0 ? styles.newest : ''}`}
            >
              <span
                className={styles.resultIcon}
                style={{ color: getResultColor(entry.result) }}
              >
                {getResultIcon(entry.result)}
              </span>
              <span className={styles.entryPlayer}>
                {entry.player === 'player' ? 'YOU' : 'BOT'}
              </span>
              <span className={styles.entryPos}>
                {formatPosition(entry.position)}
              </span>
              <span
                className={styles.entryResult}
                style={{ color: getResultColor(entry.result) }}
              >
                {entry.result === 'sunk' ? `SUNK!` : entry.result.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
