'use client'

import { useState, useCallback } from 'react'
import { useGame } from '@/context/GameContext'
import Grid from './Grid'
import { Position } from '@/types/game'
import styles from './PlacementPhase.module.css'

export default function PlacementPhase() {
  const {
    gameState,
    selectShip,
    rotateShip,
    placeShip,
    removeShip,
    autoPlaceShips,
    startBattle,
    getShipPositions,
    canPlace,
  } = useGame()

  const [hoveredPositions, setHoveredPositions] = useState<Position[]>([])
  const [previewValid, setPreviewValid] = useState(true)

  const selectedShip = gameState.playerShips.find(s => s.id === gameState.selectedShipId)

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedShip) return
      const positions = getShipPositions(
        row,
        col,
        selectedShip.size,
        gameState.placementOrientation
      )
      setHoveredPositions(positions)
      setPreviewValid(
        canPlace(row, col, selectedShip.size, gameState.placementOrientation, selectedShip.id)
      )
    },
    [selectedShip, gameState.placementOrientation, getShipPositions, canPlace]
  )

  const handleCellLeave = useCallback(() => {
    setHoveredPositions([])
  }, [])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (selectedShip) {
        placeShip(row, col)
        setHoveredPositions([])
      } else {
        // Check if clicking on a ship to select it
        const cell = gameState.playerBoard[row][col]
        if (cell.shipId) {
          selectShip(cell.shipId)
        }
      }
    },
    [selectedShip, placeShip, gameState.playerBoard, selectShip]
  )

  const allPlaced = gameState.playerShips.every(s => s.placed)

  return (
    <div className={styles.container}>
      <div className={styles.phaseTitle}>
        <span className="retro-text-cyan">[ SHIP PLACEMENT PHASE ]</span>
      </div>

      <div className={styles.content}>
        {/* Ship list */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>FLEET STATUS</div>

          <div className={styles.shipList}>
            {gameState.playerShips.map(ship => (
              <div
                key={ship.id}
                className={`${styles.shipItem} ${
                  ship.id === gameState.selectedShipId ? styles.selected : ''
                } ${ship.placed ? styles.placed : ''}`}
                onClick={() => {
                  if (ship.placed) {
                    removeShip(ship.id)
                  } else {
                    selectShip(ship.id)
                  }
                }}
              >
                <div className={styles.shipInfo}>
                  <span className={styles.shipName}>{ship.name}</span>
                  <span className={styles.shipSize}>({ship.size})</span>
                </div>
                <div className={styles.shipBlocks}>
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.shipBlock} ${ship.placed ? styles.shipBlockPlaced : ''}`}
                    />
                  ))}
                </div>
                <div className={styles.shipStatus}>
                  {ship.placed ? (
                    <span className="retro-text-yellow">PLACED ✓</span>
                  ) : ship.id === gameState.selectedShipId ? (
                    <span className="retro-text-cyan blink">PLACING...</span>
                  ) : (
                    <span style={{ color: 'rgba(0,255,65,0.4)' }}>READY</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.controls}>
            <div className={styles.controlTitle}>CONTROLS</div>

            <div className={styles.orientationDisplay}>
              <span>ORIENTATION:</span>
              <span className="retro-text-yellow">
                {gameState.placementOrientation.toUpperCase()}
              </span>
            </div>

            <button
              className="retro-btn retro-btn-cyan"
              onClick={rotateShip}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              [R] ROTATE
            </button>

            <button
              className="retro-btn retro-btn-yellow"
              onClick={autoPlaceShips}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              AUTO PLACE
            </button>

            <button
              className="retro-btn"
              onClick={startBattle}
              disabled={!allPlaced}
              style={{ width: '100%' }}
            >
              {allPlaced ? '▶ BATTLE!' : `PLACE ALL SHIPS`}
            </button>
          </div>

          {selectedShip && (
            <div className={styles.hint}>
              <span className="blink retro-text-cyan">▶</span>
              <span>CLICK GRID TO PLACE {selectedShip.name}</span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className={styles.gridArea}>
          <Grid
            board={gameState.playerBoard}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            onCellLeave={handleCellLeave}
            hoveredPositions={hoveredPositions}
            previewValid={previewValid}
            showShips={true}
            label="YOUR FLEET"
          />

          <div className={styles.gridHints}>
            <div className={styles.hintItem}>
              <span className={styles.hintDot} style={{ background: 'var(--grid-ship)' }} />
              <span>YOUR SHIP</span>
            </div>
            <div className={styles.hintItem}>
              <span className={styles.hintDot} style={{ background: 'rgba(0,255,65,0.25)' }} />
              <span>VALID PLACEMENT</span>
            </div>
            <div className={styles.hintItem}>
              <span className={styles.hintDot} style={{ background: 'rgba(255,0,64,0.25)' }} />
              <span>INVALID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
