import { type Board, type Direction, type Rocket } from './board'

export type Tick = {
    tick: number
    rocketIds: string[]
}

export type Trace = {
    ticks: Tick[]
    cleared: boolean
}

type Shot = {
    column: number
    row: number
    direction: Direction
    speed: number
}

const STEP: Record<Direction, { column: number, row: number }> = {
    north: { column: 0, row: -1 },
    east: { column: 1, row: 0 },
    south: { column: 0, row: 1 },
    west: { column: -1, row: 0 },
}

// A shot traveling east arrives at the target from the west.
const FROM: Record<Direction, Direction> = {
    north: 'south',
    east: 'west',
    south: 'north',
    west: 'east',
}

export function resolve (board: Board, startId: string): Trace
{
    const live = new Map(board.rockets.map(rocket => [rocket.id, rocket]))
    const at = new Map(board.rockets.map(rocket => [place(rocket.column, rocket.row), rocket]))

    if (!live.has(startId))
    {
        throw new Error(`No rocket ${startId}`)
    }

    const ticks: Tick[] = []
    let inFlight: Shot[] = []
    let tick = 0
    const maxTick = board.columns * board.rows * Math.max(board.rockets.length, 1) + 1

    const detonate = (ids: string[]): Shot[] =>
    {
        const rockets = ids
            .map(id => live.get(id))
            .filter((rocket): rocket is Rocket => rocket !== undefined)
            .sort((a, b) => a.row - b.row || a.column - b.column)

        const launched: Shot[] = []

        for (const rocket of rockets)
        {
            live.delete(rocket.id)
            at.delete(place(rocket.column, rocket.row))

            for (const direction of rocket.type.fires)
            {
                launched.push({
                    column: rocket.column,
                    row: rocket.row,
                    direction,
                    speed: rocket.type.speed,
                })
            }
        }

        if (rockets.length > 0)
        {
            ticks.push({
                tick,
                rocketIds: rockets.map(rocket => rocket.id),
            })
        }

        return launched
    }

    let launched = detonate([startId])

    while ((launched.length > 0 || inFlight.length > 0) && tick < maxTick)
    {
        inFlight = inFlight.concat(launched)
        launched = []
        tick += 1

        const hits: string[] = []
        const stillFlying: Shot[] = []

        for (const shot of inFlight)
        {
            const moved = move(shot, board, at, hits)

            if (moved)
            {
                stillFlying.push(moved)
            }
        }

        inFlight = stillFlying
        launched = detonate(hits)
    }

    if (tick >= maxTick)
    {
        throw new Error('Resolve did not finish')
    }

    return {
        ticks,
        cleared: live.size === 0,
    }
}

export function formatTrace (trace: Trace): string
{
    const lines = trace.ticks.map(group => `tick ${group.tick}: ${group.rocketIds.join(' ')}`)
    lines.push(trace.cleared ? 'cleared' : 'not cleared')
    return lines.join('\n')
}

function move (shot: Shot, board: Board, at: Map<string, Rocket>, hits: string[]): Shot | undefined
{
    let column = shot.column
    let row = shot.row

    for (let step = 0; step < shot.speed; step++)
    {
        column += STEP[shot.direction].column
        row += STEP[shot.direction].row

        if (column < 0 || row < 0 || column >= board.columns || row >= board.rows)
        {
            return undefined
        }

        const target = at.get(place(column, row))

        if (!target)
        {
            continue
        }

        if (target.type.accepts.includes(FROM[shot.direction]))
        {
            hits.push(target.id)
        }

        // A rejected rocket stays. The shot stops on that cell either way.
        return undefined
    }

    return {
        column,
        row,
        direction: shot.direction,
        speed: shot.speed,
    }
}

function place (column: number, row: number): string
{
    return `${column},${row}`
}
