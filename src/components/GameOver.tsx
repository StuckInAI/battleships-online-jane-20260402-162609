'use client'

import { useEffect, useState } from 'react'
import { useGame } from '@/context/GameContext'
import styles from './GameOver.module.css'

export default function GameOver() {
  const { gameState, resetGame, startGame } = useGame()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const playerWon = gameState.winner === 'player'

  const playerHits = gameState.attackLog.filter(
    e => e.player === 'player' && (e.result === 'hit' || e.result === 'sunk')
  ).length
  const playerMisses = gameState.attackLog.filter(
    e => e.player === 'player' && e.result === 'miss'
  ).length
  const playerTotal = playerHits + playerMisses
  const accuracy = playerTotal > 0 ? Math.round((playerHits / playerTotal) * 100) : 0

  const botHits = gameState.attackLog.filter(
    e => e.player === 'bot' && (e.result === 'hit' || e.result === 'sunk')
  ).length
  const botMisses = gameState.attackLog.filter(
    e => e.player === 'bot' && e.result === 'miss'
  ).length

  const sunkenByPlayer = gameState.botShips.filter(s => s.sunk).length
  const sunkenByBot = gameState.playerShips.filter(s => s.sunk).length

  return (
    <div className={styles.container}>
      {showContent && (
        <>
          <div className={styles.resultBanner}>
            {playerWon ? (
              <>
                <div className={styles.victoryText}>
                  <span className="retro-text-yellow">VICTORY!</span>
                </div>
                <pre className={styles.resultAscii}>
{`
  ████████╗██████╗ ██╗██╗   ██╗███╗   ███╗██████╗ ██╗  ██╗
  ╚══██╔══╝██╔══██╗██║██║   ██║████╗ ████║██╔══██╗██║  ██║
     ██║   ██████╔╝██║██║   ██║██╔████╔██║██████╔╝███████║
     ██║   ██╔══██╗██║██║   ██║██║╚██╔╝██║██╔═══╝ ██╔══██║
     ██║   ██║  ██║██║╚██████╔╝██║ ╚═╝ ██║██║     ██║  ██║
     ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝
`}
                </pre>
              </>
            ) : (
              <>
                <div className={styles.defeatText}>
                  <span className="retro-text-red">DEFEAT!</span>
                </div>
                <pre className={styles.resultAscii}>
{`
  ██████╗ ███████╗███████╗███████╗ █████╗ ████████╗
  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗╚══██╔══╝
  ██║  ██║█████╗  █████╗  █████╗  ███████║   ██║   
  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██║   ██║   
  ██████╔╝███████╗██║     ███████╗██║  ██║   ██║   
  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   
`}
                </pre>
              </>
            )}
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statsTitle}>BATTLE STATISTICS</div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>YOUR SHOTS</div>
                <div className={styles.statValue}>{playerTotal}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>YOUR HITS</div>
                <div className={`${styles.statValue} retro-text-red`}>{playerHits}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>ACCURACY</div>
                <div className={`${styles.statValue} retro-text-yellow`}>{accuracy}%</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>SHIPS SUNK</div>
                <div className={`${styles.statValue} retro-text-cyan`}>{sunkenByPlayer}/5</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>BOT HITS</div>
                <div className={`${styles.statValue} retro-text-red`}>{botHits}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>YOUR LOSSES</div>
                <div className={`${styles.statValue} retro-text-red`}>{sunkenByBot}/5</div>
              </div>
            </div>
          </div>

          <div className={styles.shipSummary}>
            <div className={styles.summaryTitle}>FLEET SUMMARY</div>
            <div className={styles.fleets}>
              <div className={styles.fleetCol}>
                <div className={styles.fleetLabel}>YOUR FLEET</div>
                {gameState.playerShips.map(ship => (
                  <div key={ship.id} className={styles.shipRow}>
                    <span className={ship.sunk ? styles.shipSunk : styles.shipSurvived}>
                      {ship.sunk ? '☠' : '✓'}
                    </span>
                    <span className={styles.shipRowName}>{ship.name}</span>
                    <span className={styles.shipRowStatus}>
                      {ship.sunk ? 'SUNK' : 'SURVIVED'}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.fleetDivider} />
              <div className={styles.fleetCol}>
                <div className={styles.fleetLabel}>ENEMY FLEET</div>
                {gameState.botShips.map(ship => (
                  <div key={ship.id} className={styles.shipRow}>
                    <span className={ship.sunk ? styles.shipSunk : styles.shipSurvived}>
                      {ship.sunk ? '☠' : '✓'}
                    </span>
                    <span className={styles.shipRowName}>{ship.name}</span>
                    <span className={styles.shipRowStatus}>
                      {ship.sunk ? 'SUNK' : 'SURVIVED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className="retro-btn retro-btn-cyan" onClick={startGame}>
              PLAY AGAIN
            </button>
            <button className="retro-btn" onClick={resetGame}>
              MAIN MENU
            </button>
          </div>
        </>
      )}
    </div>
  )
}
