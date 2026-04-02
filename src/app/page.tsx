'use client'

import { useState, useEffect } from 'react'
import { GameProvider, useGame } from '@/context/GameContext'
import PlacementPhase from '@/components/PlacementPhase'
import BattlePhase from '@/components/BattlePhase'
import GameOver from '@/components/GameOver'
import MainMenu from '@/components/MainMenu'
import styles from './page.module.css'

function GameContent() {
  const { gameState } = useGame()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerDecor}>{'>>>'}</span>
        </div>
        <h1 className={styles.title}>
          <span className="retro-text-glow">BATTLE</span>
          <span className="retro-text-cyan">SHIP</span>
        </h1>
        <div className={styles.headerRight}>
          <span className={styles.headerDecor}>{'<<<'}</span>
        </div>
      </header>

      <div className={styles.subHeader}>
        <span className="retro-text-yellow">// NAVAL WARFARE SIMULATOR v2.0 //</span>
      </div>

      <main className={styles.main}>
        {gameState.phase === 'menu' && <MainMenu />}
        {gameState.phase === 'placement' && <PlacementPhase />}
        {gameState.phase === 'battle' && <BattlePhase />}
        {gameState.phase === 'gameover' && <GameOver />}
      </main>

      <footer className={styles.footer}>
        <span>INSERT COIN TO CONTINUE</span>
        <span className="blink">█</span>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
