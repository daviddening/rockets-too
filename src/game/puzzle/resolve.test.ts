import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseMap, printMap } from './board'
import { formatTrace, resolve, type Trace } from './resolve'

test('one rocket clears the board', () =>
{
    expectTrace('>', 'c0r0', {
        ticks: [{ tick: 0, rocketIds: ['c0r0'] }],
        cleared: true,
    })
})

test('a chain along a row clears in travel order', () =>
{
    expectTrace('> > >', 'c0r0', {
        ticks: [
            { tick: 0, rocketIds: ['c0r0'] },
            { tick: 1, rocketIds: ['c1r0'] },
            { tick: 2, rocketIds: ['c2r0'] },
        ],
        cleared: true,
    })
})

test('a shot that leaves the board does not hit a rocket off its ray', () =>
{
    expectTrace(`
> .
. v
`, 'c0r0', {
        ticks: [{ tick: 0, rocketIds: ['c0r0'] }],
        cleared: false,
    })
})

test('a click that hits part of the board does not clear it', () =>
{
    expectTrace(`
> > .
. . v
`, 'c0r0', {
        ticks: [
            { tick: 0, rocketIds: ['c0r0'] },
            { tick: 1, rocketIds: ['c1r0'] },
        ],
        cleared: false,
    })
})

test('printMap shows a space between cells', () =>
{
    assert.equal(printMap(parseMap('>>')), '> >')
})

function expectTrace (map: string, startId: string, expected: Trace)
{
    const board = parseMap(map)
    const actual = resolve(board, startId)
    assert.deepEqual(
        actual,
        expected,
        `\n${printMap(board)}\n${formatTrace(actual)}`
    )
}
