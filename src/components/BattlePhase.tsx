'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import Grid from './Grid'
import AttackLog from './AttackLog'
import styles from './BattlePhase.module.css'

export default function BattlePhase() {
  const { gameState, playerAttack, triggerBotAttack } = useGame()
  const [botThinking, setBotThinking] = useState(false)
  const [statusMessage, setStatusMessage] = useState('YOUR TURN - SELECT TARGET')

  useEffect(() => {
    if (gameState.currentTurn === 'bot' && gameState.phase === 'battle') {
      setBotThinking(true)
      setStatusMessage('BOT IS THINKING...')
      const delay = 800 + Math.random() * 700
      const timer = setTimeout(() => {
        triggerBotAttack()
        setBotThinking(false)
      }, delay)
      return () => clearTimeout(timer)
    } else if (gameState.currentTurn === 'player' && gameState.phase === 'battle') {
      setStatusMessage('YOUR TURN - SELECT TARGET')
    }
  }, [gameState.currentTurn, gameState.phase, triggerBotAttack])

  useEffect(() => {
    if (gameState.attackLog.length > 0) {
      const last = gameState.attackLog[0]
      if (last.result === 'sunk') {
        setStatusMessage(
          last.player === 'player'
            ? `YOU SUNK ENEMY ${last.shipName}!`
            : `BOT SUNK YOUR ${last.shipName}!`
        )
      } else if (last.result === 'hit') {
        setStatusMessage(
          last.player === 'player' ? 'DIRECT HIT!' : 'BOT HIT YOUR SHIP!'
        )
      } else {
        setStatusMessage(
          last.player === 'player' ? 'MISS! BOT TURN...' : 'BOT MISSED! YOUR TURN'
        )
      }
    }
  }, [gameState.attackLog])

  const handleAttack = useCallback(
    (row: number, col: number) => {
      if (gameState.currentTurn !== 'player' || botThinking) return
      playerAttack(row, col)
    },
    [gameState.currentTurn, botThinking, playerAttack]
  )

  const playerShipsAlive = gameState.playerShips.filter(s => !s.sunk).length
  const botShipsAlive = gameState.botShips.filter(s => !s.sunk).length

  const getStatusClass = () => {
    if (botThinking) return styles.statusThinking
    const last = gameState.attackLog[0]
    if (!last) return styles.statusNormal
    if (last.result === 'sunk') return styles.statusSunk
    if (last.result === 'hit') return styles.statusHit
    return styles.statusNormal
  }

  return (
    <div className={styles.container}>
      <div className={styles.phaseTitle}>
        <span className="retro-text-cyan">[ BATTLE PHASE ]</span>
      </div>

      {/* Status Bar */}
      <div className={`${styles.statusBar} ${getStatusClass()}`}>
        <span className={botThinking ? 'blink' : ''}>{statusMessage}</span>
        {botThinking && <span className={styles.dots}>...</span>}
      </div>

      {/* Turn Indicator */}
      <div className={styles.turnIndicator}>
        <div className={`${styles.turnBox} ${gameState.currentTurn === 'player' ? styles.activeTurn : ''}`}>
          <span>PLAYER</span>
          <span className={styles.shipsCount}>{playerShipsAlive}/5 SHIPS</span>
        </div>
        <div className={styles.vs}>VS</div>
        <div className={`${styles.turnBox} ${gameState.currentTurn === 'bot' ? styles.activeTurn : ''}`}>
          <span>BOT</span>
          <span className={styles.shipsCount}>{botShipsAlive}/5 SHIPS</span>
        </div>
      </div>

      <div className={styles.battleArea}>
        {/* Player's board */}
        <div className={styles.boardSection}>
          <div className={styles.boardLabel}>
            <span className="retro-text-green">YOUR WATERS</span>
            <div className={styles.shipStatus}>
              {gameState.playerShips.map(ship => (
                <span
                  key={ship.id}
                  className={`${styles.shipDot} ${ship.sunk ? styles.shipDotSunk : styles.shipDotAlive}`}
                  title={ship.name}
                />
              ))}
            </div>
          </div>
          <Grid
            board={gameState.playerBoard}
            showShips={true}
            disabled={true}
            label="DEFENSIVE GRID"
          />
        </div>

        {/* Attack Log */}
        <div className={styles.logSection}>
          <AttackLog log={gameState.attackLog} />
        </div>

        {/* Enemy board */}
        <div className={styles.boardSection}>
          <div className={styles.boardLabel}>
            <span className="retro-text-red">ENEMY WATERS</span>
            <div className={styles.shipStatus}>
              {gameState.botShips.map(ship => (
                <span
                  key={ship.id}
                  className={`${styles.shipDot} ${ship.sunk ? styles.shipDotSunk : styles.shipDotAlive}`}
                  title={ship.name}
                />
              ))}
            </div>
          </div>
          <Grid
            board={gameState.botBoard}
            isEnemy={true}
            onCellClick={handleAttack}
            showShips={false}
            disabled={gameState.currentTurn !== 'player' || botThinking}
            label="ATTACK GRID"
          />
        </div>
      </div>
    </div>
  )
}
