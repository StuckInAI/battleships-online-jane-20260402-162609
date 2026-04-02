'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import {
  GameState,
  Board,
  Cell,
  Ship,
  Position,
  Orientation,
  Player,
  SHIPS_CONFIG,
  BOARD_SIZE,
  AttackLogEntry,
} from '@/types/game'

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, (): Cell => ({ state: 'empty', shipId: null }))
  )
}

function createInitialShips(): Ship[] {
  return SHIPS_CONFIG.map(config => ({
    ...config,
    placed: false,
    sunk: false,
    hits: 0,
    positions: [],
  }))
}

function canPlaceShip(
  board: Board,
  positions: Position[]
): boolean {
  for (const pos of positions) {
    if (pos.row < 0 || pos.row >= BOARD_SIZE || pos.col < 0 || pos.col >= BOARD_SIZE) {
      return false
    }
    if (board[pos.row][pos.col].shipId !== null) {
      return false
    }
    // Check adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = pos.row + dr
        const nc = pos.col + dc
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[nr][nc].shipId !== null) {
            return false
          }
        }
      }
    }
  }
  return true
}

function getShipPositions(row: number, col: number, size: number, orientation: Orientation): Position[] {
  const positions: Position[] = []
  for (let i = 0; i < size; i++) {
    positions.push({
      row: orientation === 'vertical' ? row + i : row,
      col: orientation === 'horizontal' ? col + i : col,
    })
  }
  return positions
}

function placeShipOnBoard(board: Board, ship: Ship, positions: Position[]): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  for (const pos of positions) {
    newBoard[pos.row][pos.col] = { state: 'ship', shipId: ship.id }
  }
  return newBoard
}

function removeShipFromBoard(board: Board, shipId: string): Board {
  return board.map(row =>
    row.map(cell => (cell.shipId === shipId ? { state: 'empty' as const, shipId: null } : cell))
  )
}

function randomlyPlaceShips(ships: Ship[]): { board: Board; ships: Ship[] } {
  let board = createEmptyBoard()
  const placedShips: Ship[] = []

  for (const ship of ships) {
    let placed = false
    let attempts = 0
    while (!placed && attempts < 1000) {
      attempts++
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      const row = Math.floor(Math.random() * BOARD_SIZE)
      const col = Math.floor(Math.random() * BOARD_SIZE)
      const positions = getShipPositions(row, col, ship.size, orientation)

      if (canPlaceShip(board, positions)) {
        board = placeShipOnBoard(board, ship, positions)
        placedShips.push({ ...ship, placed: true, positions })
        placed = true
      }
    }
    if (!placed) {
      // Fallback: reset and retry
      return randomlyPlaceShips(ships)
    }
  }

  return { board, ships: placedShips }
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SELECT_SHIP'; shipId: string }
  | { type: 'ROTATE_SHIP' }
  | { type: 'PLACE_SHIP'; row: number; col: number }
  | { type: 'REMOVE_SHIP'; shipId: string }
  | { type: 'AUTO_PLACE_SHIPS' }
  | { type: 'START_BATTLE' }
  | { type: 'PLAYER_ATTACK'; row: number; col: number }
  | { type: 'BOT_ATTACK' }
  | { type: 'RESET_GAME' }

const initialState: GameState = {
  phase: 'menu',
  currentTurn: 'player',
  playerBoard: createEmptyBoard(),
  botBoard: createEmptyBoard(),
  playerShips: createInitialShips(),
  botShips: createInitialShips(),
  winner: null,
  attackLog: [],
  selectedShipId: null,
  placementOrientation: 'horizontal',
  botTargetQueue: [],
  botLastHit: null,
  botHitStack: [],
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { board: botBoard, ships: botShips } = randomlyPlaceShips(createInitialShips())
      return {
        ...initialState,
        phase: 'placement',
        botBoard,
        botShips,
        playerBoard: createEmptyBoard(),
        playerShips: createInitialShips(),
      }
    }

    case 'SELECT_SHIP': {
      return { ...state, selectedShipId: action.shipId }
    }

    case 'ROTATE_SHIP': {
      return {
        ...state,
        placementOrientation:
          state.placementOrientation === 'horizontal' ? 'vertical' : 'horizontal',
      }
    }

    case 'PLACE_SHIP': {
      if (!state.selectedShipId) return state
      const ship = state.playerShips.find(s => s.id === state.selectedShipId)
      if (!ship) return state

      const positions = getShipPositions(
        action.row,
        action.col,
        ship.size,
        state.placementOrientation
      )

      // Remove ship from board first if already placed
      let board = ship.placed
        ? removeShipFromBoard(state.playerBoard, ship.id)
        : state.playerBoard

      if (!canPlaceShip(board, positions)) return state

      board = placeShipOnBoard(board, ship, positions)
      const updatedShips = state.playerShips.map(s =>
        s.id === ship.id ? { ...s, placed: true, positions } : s
      )

      // Auto-select next unplaced ship
      const nextShip = updatedShips.find(s => !s.placed)

      return {
        ...state,
        playerBoard: board,
        playerShips: updatedShips,
        selectedShipId: nextShip ? nextShip.id : null,
      }
    }

    case 'REMOVE_SHIP': {
      const board = removeShipFromBoard(state.playerBoard, action.shipId)
      const updatedShips = state.playerShips.map(s =>
        s.id === action.shipId ? { ...s, placed: false, positions: [] } : s
      )
      return {
        ...state,
        playerBoard: board,
        playerShips: updatedShips,
        selectedShipId: action.shipId,
      }
    }

    case 'AUTO_PLACE_SHIPS': {
      const unplacedShips = state.playerShips.filter(s => !s.placed)
      let board = state.playerBoard

      // Remove already placed ships first, then re-place all
      const { board: newBoard, ships: newShips } = randomlyPlaceShips(createInitialShips())
      return {
        ...state,
        playerBoard: newBoard,
        playerShips: newShips,
        selectedShipId: null,
      }
    }

    case 'START_BATTLE': {
      const allPlaced = state.playerShips.every(s => s.placed)
      if (!allPlaced) return state
      return { ...state, phase: 'battle', currentTurn: 'player' }
    }

    case 'PLAYER_ATTACK': {
      if (state.currentTurn !== 'player' || state.phase !== 'battle') return state

      const { row, col } = action
      const cell = state.botBoard[row][col]

      if (cell.state === 'hit' || cell.state === 'miss' || cell.state === 'sunk') return state

      const newBotBoard = state.botBoard.map(r => r.map(c => ({ ...c })))
      let newBotShips = state.botShips.map(s => ({ ...s }))
      let result: 'hit' | 'miss' | 'sunk' = 'miss'
      let shipName: string | undefined

      if (cell.shipId) {
        result = 'hit'
        const shipIdx = newBotShips.findIndex(s => s.id === cell.shipId)
        if (shipIdx !== -1) {
          newBotShips[shipIdx].hits += 1
          shipName = newBotShips[shipIdx].name
          if (newBotShips[shipIdx].hits >= newBotShips[shipIdx].size) {
            newBotShips[shipIdx].sunk = true
            result = 'sunk'
            // Mark all cells of sunk ship
            newBotShips[shipIdx].positions.forEach(pos => {
              newBotBoard[pos.row][pos.col].state = 'sunk'
            })
          } else {
            newBotBoard[row][col].state = 'hit'
          }
        }
      } else {
        newBotBoard[row][col].state = 'miss'
      }

      const logEntry: AttackLogEntry = {
        player: 'player',
        position: { row, col },
        result,
        shipName,
        timestamp: Date.now(),
      }

      const allSunk = newBotShips.every(s => s.sunk)
      if (allSunk) {
        return {
          ...state,
          botBoard: newBotBoard,
          botShips: newBotShips,
          attackLog: [logEntry, ...state.attackLog],
          phase: 'gameover',
          winner: 'player',
        }
      }

      return {
        ...state,
        botBoard: newBotBoard,
        botShips: newBotShips,
        attackLog: [logEntry, ...state.attackLog],
        currentTurn: 'bot',
      }
    }

    case 'BOT_ATTACK': {
      if (state.currentTurn !== 'bot' || state.phase !== 'battle') return state

      const attackedPositions = new Set<string>()
      state.playerBoard.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.state === 'hit' || cell.state === 'miss' || cell.state === 'sunk') {
            attackedPositions.add(`${r},${c}`)
          }
        })
      })

      let targetPos: Position | null = null

      // Use hit stack for targeted attacks
      const hitStack = [...state.botHitStack]

      while (hitStack.length > 0 && !targetPos) {
        const candidate = hitStack[hitStack.length - 1]
        const key = `${candidate.row},${candidate.col}`
        if (!attackedPositions.has(key)) {
          targetPos = candidate
          hitStack.pop()
        } else {
          hitStack.pop()
        }
      }

      // Random attack if no target
      if (!targetPos) {
        const available: Position[] = []
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (!attackedPositions.has(`${r},${c}`)) {
              available.push({ row: r, col: c })
            }
          }
        }
        if (available.length === 0) return state
        targetPos = available[Math.floor(Math.random() * available.length)]
      }

      const { row, col } = targetPos
      const cell = state.playerBoard[row][col]
      const newPlayerBoard = state.playerBoard.map(r => r.map(c => ({ ...c })))
      let newPlayerShips = state.playerShips.map(s => ({ ...s }))
      let result: 'hit' | 'miss' | 'sunk' = 'miss'
      let shipName: string | undefined
      let newHitStack = [...hitStack]

      if (cell.shipId) {
        result = 'hit'
        const shipIdx = newPlayerShips.findIndex(s => s.id === cell.shipId)
        if (shipIdx !== -1) {
          newPlayerShips[shipIdx].hits += 1
          shipName = newPlayerShips[shipIdx].name
          if (newPlayerShips[shipIdx].hits >= newPlayerShips[shipIdx].size) {
            newPlayerShips[shipIdx].sunk = true
            result = 'sunk'
            newPlayerShips[shipIdx].positions.forEach(pos => {
              newPlayerBoard[pos.row][pos.col].state = 'sunk'
            })
            // Clear hit stack for this ship
            newHitStack = newHitStack.filter(p => {
              return newPlayerBoard[p.row][p.col].shipId !== cell.shipId
            })
          } else {
            newPlayerBoard[row][col].state = 'hit'
            // Add adjacent cells to hit stack
            const adjacents: Position[] = [
              { row: row - 1, col },
              { row: row + 1, col },
              { row, col: col - 1 },
              { row, col: col + 1 },
            ]
            for (const adj of adjacents) {
              if (
                adj.row >= 0 && adj.row < BOARD_SIZE &&
                adj.col >= 0 && adj.col < BOARD_SIZE &&
                !attackedPositions.has(`${adj.row},${adj.col}`) &&
                !newHitStack.some(p => p.row === adj.row && p.col === adj.col)
              ) {
                newHitStack.push(adj)
              }
            }
          }
        }
      } else {
        newPlayerBoard[row][col].state = 'miss'
      }

      const logEntry: AttackLogEntry = {
        player: 'bot',
        position: { row, col },
        result,
        shipName,
        timestamp: Date.now(),
      }

      const allSunk = newPlayerShips.every(s => s.sunk)
      if (allSunk) {
        return {
          ...state,
          playerBoard: newPlayerBoard,
          playerShips: newPlayerShips,
          attackLog: [logEntry, ...state.attackLog],
          botHitStack: newHitStack,
          phase: 'gameover',
          winner: 'bot',
        }
      }

      return {
        ...state,
        playerBoard: newPlayerBoard,
        playerShips: newPlayerShips,
        attackLog: [logEntry, ...state.attackLog],
        botHitStack: newHitStack,
        currentTurn: 'player',
      }
    }

    case 'RESET_GAME': {
      return { ...initialState }
    }

    default:
      return state
  }
}

interface GameContextType {
  gameState: GameState
  startGame: () => void
  selectShip: (shipId: string) => void
  rotateShip: () => void
  placeShip: (row: number, col: number) => void
  removeShip: (shipId: string) => void
  autoPlaceShips: () => void
  startBattle: () => void
  playerAttack: (row: number, col: number) => void
  triggerBotAttack: () => void
  resetGame: () => void
  getShipPositions: (row: number, col: number, size: number, orientation: Orientation) => Position[]
  canPlace: (row: number, col: number, size: number, orientation: Orientation, excludeShipId?: string) => boolean
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const selectShip = useCallback((shipId: string) => dispatch({ type: 'SELECT_SHIP', shipId }), [])
  const rotateShip = useCallback(() => dispatch({ type: 'ROTATE_SHIP' }), [])
  const placeShip = useCallback((row: number, col: number) => dispatch({ type: 'PLACE_SHIP', row, col }), [])
  const removeShip = useCallback((shipId: string) => dispatch({ type: 'REMOVE_SHIP', shipId }), [])
  const autoPlaceShips = useCallback(() => dispatch({ type: 'AUTO_PLACE_SHIPS' }), [])
  const startBattle = useCallback(() => dispatch({ type: 'START_BATTLE' }), [])
  const playerAttack = useCallback((row: number, col: number) => dispatch({ type: 'PLAYER_ATTACK', row, col }), [])
  const triggerBotAttack = useCallback(() => dispatch({ type: 'BOT_ATTACK' }), [])
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), [])

  const getShipPositionsHelper = useCallback(
    (row: number, col: number, size: number, orientation: Orientation) =>
      getShipPositions(row, col, size, orientation),
    []
  )

  const canPlace = useCallback(
    (row: number, col: number, size: number, orientation: Orientation, excludeShipId?: string) => {
      let board = gameState.playerBoard
      if (excludeShipId) {
        board = removeShipFromBoard(board, excludeShipId)
      }
      const positions = getShipPositions(row, col, size, orientation)
      return canPlaceShip(board, positions)
    },
    [gameState.playerBoard]
  )

  return (
    <GameContext.Provider
      value={{
        gameState,
        startGame,
        selectShip,
        rotateShip,
        placeShip,
        removeShip,
        autoPlaceShips,
        startBattle,
        playerAttack,
        triggerBotAttack,
        resetGame,
        getShipPositions: getShipPositionsHelper,
        canPlace,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
