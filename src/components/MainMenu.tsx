'use client'

import { useGame } from '@/context/GameContext'
import styles from './MainMenu.module.css'

export default function MainMenu() {
  const { startGame } = useGame()

  return (
    <div className={styles.container}>
      <div className={styles.asciiArt}>
        <pre className={styles.ascii}>
{`
 ██████╗  █████╗ ████████╗████████╗██╗     ███████╗
 ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝
 ██████╔╝███████║   ██║      ██║   ██║     █████╗  
 ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  
 ██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗
 ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
`}
        </pre>
      </div>

      <div className={styles.shipArt}>
        <pre className={styles.shipAscii}>
{`        ~  ~  ~  ~  ~  ~  ~  ~
   __|____|______|__________|__
  /  |   |      |          |  \\
 /   |   |      |          |   \\
/    |   |      |          |    \\
~~~~~|~~~|~~~~~~|~~~~~~~~~~|~~~~~
        ~  ~  ~  ~  ~  ~  ~  ~`}
        </pre>
      </div>

      <div className={styles.menuBox}>
        <div className={styles.menuTitle}>
          <span className="retro-text-cyan">[ MAIN MENU ]</span>
        </div>

        <div className={styles.menuItems}>
          <div className={styles.menuItem}>
            <span className={styles.cursor}>▶</span>
            <button className="retro-btn" onClick={startGame}>
              NEW GAME
            </button>
          </div>
        </div>

        <div className={styles.instructions}>
          <div className={styles.instrTitle}>HOW TO PLAY:</div>
          <div className={styles.instrItem}>
            <span className="retro-text-yellow">1.</span> PLACE YOUR SHIPS ON THE GRID
          </div>
          <div className={styles.instrItem}>
            <span className="retro-text-yellow">2.</span> CLICK ENEMY GRID TO ATTACK
          </div>
          <div className={styles.instrItem}>
            <span className="retro-text-yellow">3.</span> SINK ALL ENEMY SHIPS TO WIN
          </div>
          <div className={styles.instrItem}>
            <span className="retro-text-yellow">4.</span> BEWARE THE BOT AI!
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendTitle}>LEGEND:</div>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--grid-ship)' }}></span>
              <span>SHIP</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--grid-hit)' }}></span>
              <span>HIT</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--grid-miss)' }}></span>
              <span>MISS</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--grid-sunk)' }}></span>
              <span>SUNK</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.pressStart}>
        <span className="blink retro-text-yellow">▶ PRESS [NEW GAME] TO START ◀</span>
      </div>
    </div>
  )
}
