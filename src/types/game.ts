export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk'

export type Orientation = 'horizontal' | 'vertical'

export type GamePhase = 'menu' | 'placement' | 'battle' | 'gameover'

export type Player = 'player' | 'bot'

export interface Ship {
  id: string
  name: string
  size: number
  placed: boolean
  sunk: boolean
  hits: number
  positions: Position[]
}

export interface Position {
  row: number
  col: number
}

export interface Cell {
  state: CellState
  shipId: string | null
}

export type Board = Cell[][]

export interface GameState {
  phase: GamePhase
  currentTurn: Player
  playerBoard: Board
  botBoard: Board
  playerShips: Ship[]
  botShips: Ship[]
  winner: Player | null
  attackLog: AttackLogEntry[]
  selectedShipId: string | null
  placementOrientation: Orientation
  botTargetQueue: Position[]
  botLastHit: Position | null
  botHitStack: Position[]
}

export interface AttackLogEntry {
  player: Player
  position: Position
  result: 'hit' | 'miss' | 'sunk'
  shipName?: string
  timestamp: number
}

export const SHIPS_CONFIG: Omit<Ship, 'placed' | 'sunk' | 'hits' | 'positions'>[] = [
  { id: 'carrier', name: 'CARRIER', size: 5 },
  { id: 'battleship', name: 'BATTLESHIP', size: 4 },
  { id: 'cruiser', name: 'CRUISER', size: 3 },
  { id: 'submarine', name: 'SUBMARINE', size: 3 },
  { id: 'destroyer', name: 'DESTROYER', size: 2 },
]

export const BOARD_SIZE = 10
