export type Direction = 'north' | 'east' | 'south' | 'west'

export type RocketType = {
    fires: Direction[]
    accepts: Direction[]
    speed: number
}

export type Rocket = {
    id: string
    column: number
    row: number
    type: RocketType
}

export type Board = {
    columns: number
    rows: number
    rockets: Rocket[]
}

export const DIRECTIONS: Direction[] = ['north', 'east', 'south', 'west']

const GLYPH: Record<string, Direction> = {
    '^': 'north',
    '>': 'east',
    'v': 'south',
    '<': 'west',
}

const FIRE_GLYPH: Record<Direction, string> = {
    north: '^',
    east: '>',
    south: 'v',
    west: '<',
}

export function rocketId (column: number, row: number): string
{
    return `c${column}r${row}`
}

export function dumbRocket (fires: Direction): RocketType
{
    return {
        fires: [fires],
        accepts: [...DIRECTIONS],
        speed: 1,
    }
}

export function parseMap (text: string): Board
{
    const lines = text
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

    if (lines.length === 0)
    {
        throw new Error('Map is empty')
    }

    const rows = lines.map(cellsOf)
    const columns = rows[0].length

    for (const row of rows)
    {
        if (row.length !== columns)
        {
            throw new Error('Map rows have different widths')
        }
    }

    const rockets: Rocket[] = []

    rows.forEach((row, rowIndex) =>
    {
        row.forEach((cell, column) =>
        {
            if (cell === '.')
            {
                return
            }

            const fires = GLYPH[cell]

            if (!fires)
            {
                throw new Error(`Unknown map cell '${cell}'`)
            }

            rockets.push({
                id: rocketId(column, rowIndex),
                column,
                row: rowIndex,
                type: dumbRocket(fires),
            })
        })
    })

    return {
        columns,
        rows: rows.length,
        rockets,
    }
}

export function printMap (board: Board): string
{
    const cells = Array.from({ length: board.rows }, () => Array(board.columns).fill('.'))

    for (const rocket of board.rockets)
    {
        const fires = rocket.type.fires[0]
        cells[rocket.row][rocket.column] = fires ? FIRE_GLYPH[fires] : '?'
    }

    return cells.map(row => row.join(' ')).join('\n')
}

function cellsOf (line: string): string[]
{
    if (line.includes(' '))
    {
        return line.split(/\s+/)
    }

    return [...line]
}
