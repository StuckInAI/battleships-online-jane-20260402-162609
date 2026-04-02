'use client'

import { useState, useCallback } from 'react'
import { Board, Orientation, Position } from '@/types/game'
import styles from './Grid.module.css'

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

interface GridProps {
  board: Board
  isEnemy?: boolean
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (row: number, col: number) => void
  onCellLeave?: () => void
  hoveredPositions?: Position[]
  previewValid?: boolean
  showShips?: boolean
  disabled?: boolean
  label?: string
}

export default function Grid({
  board,
  isEnemy = false,
  onCellClick,
  onCellHover,
  onCellLeave,
  hoveredPositions = [],
  previewValid = true,
  showShips = true,
  disabled = false,
  label,
}: GridProps) {
  const [animatedCells, setAnimatedCells] = useState<Set<string>>(new Set())

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (disabled) return
      const key = `${row},${col}`
      setAnimatedCells(prev => new Set([...prev, key]))
      setTimeout(() => {
        setAnimatedCells(prev => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }, 600)
      onCellClick?.(row, col)
    },
    [disabled, onCellClick]
  )

  const getCellClass = (row: number, col: number): string => {
    const cell = board[row][col]
    const key = `${row},${col}`
    const isHovered = hoveredPositions.some(p => p.row === row && p.col === col)
    const isAnimated = animatedCells.has(key)

    let cls = styles.cell

    if (isHovered) {
      cls += previewValid ? ` ${styles.previewValid}` : ` ${styles.previewInvalid}`
      return cls
    }

    switch (cell.state) {
      case 'ship':
        if (showShips) cls += ` ${styles.ship}`
        break
      case 'hit':
        cls += ` ${styles.hit}`
        if (isAnimated) cls += ` ${styles.hitAnim}`
        break
      case 'miss':
        cls += ` ${styles.miss}`
        if (isAnimated) cls += ` ${styles.missAnim}`
        break
      case 'sunk':
        cls += ` ${styles.sunk}`
        break
    }

    if (isEnemy && cell.state === 'empty' && !disabled) {
      cls += ` ${styles.attackable}`
    }

    return cls
  }

  const getCellContent = (row: number, col: number): string => {
    const cell = board[row][col]
    const isHovered = hoveredPositions.some(p => p.row === row && p.col === col)
    if (isHovered) return ''
    switch (cell.state) {
      case 'hit': return '✕'
      case 'miss': return '•'
      case 'sunk': return '✕'
      default: return ''
    }
  }

  return (
    <div className={styles.gridWrapper}>
      {label && <div className={styles.gridLabel}>{label}</div>}
      <div className={styles.gridContainer}>
        {/* Column headers */}
        <div className={styles.colHeaders}>
          <div className={styles.cornerCell}></div>
          {COLS.map(col => (
            <div key={col} className={styles.headerCell}>{col}</div>
          ))}
        </div>

        {/* Grid rows */}
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className={styles.gridRow}>
            <div className={styles.rowHeader}>{ROWS[rowIdx]}</div>
            {row.map((_, colIdx) => (
              <div
                key={colIdx}
                className={getCellClass(rowIdx, colIdx)}
                onClick={() => handleClick(rowIdx, colIdx)}
                onMouseEnter={() => onCellHover?.(rowIdx, colIdx)}
                onMouseLeave={() => onCellLeave?.()}
              >
                <span className={styles.cellContent}>
                  {getCellContent(rowIdx, colIdx)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
