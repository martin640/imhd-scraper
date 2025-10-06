import { getDepartures, getLine, getLines, getLineSchedule, LineStop, LineStopWithDeparture } from '../src'
import { timePrettyFormat } from '../src'

describe('testing index file', () => {
    let lineStop: LineStop | null = null
    let firstDeparture: LineStopWithDeparture | null = null
    
    test('check getLines() works', async () => {
        const x = await getLines()
        expect(x.length).toBeGreaterThan(100)
    })
    
    test('check getLineByNumber() works', async () => {
        const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
            getLine('4', { firstStop: 'Pri kríži' }),
            getLine('4', { firstStop: 'Pri kríži', lastStop: 'Zlaté piesky' }),
            getLine('4', { via: 'Magnetová' }),
            getLine('4', { via: ['Magnetová', 'Stn. Nové Mesto'] }),
            getLine('4', { lastStop: ['Zlaté piesky', 'Stn. Nové Mesto'] }),
            getLine('2', { cityCode: 'tn' }),
            getLine('2', { cityCode: 'tatry' }) // todo: this should yield more routes, doesn't take terminus points into account properly!!
        ])
        
        expect(r1.length).toBe(2)
        expect(r2.length).toBe(1)
        expect(r3.length).toBe(2)
        expect(r4.length).toBe(0)
        expect(r5.length).toBe(2)
        expect(r6.length).toBe(6)
        expect(r7.length).toBe(9) // todo: should be 13
        
        r1.forEach(y => expect(y.stops[0].platform.station.label).toBe('Pri kríži'))
        r2.forEach(y => expect(y.stops[0].platform.station.label).toBe('Pri kríži'))
        r5.forEach(y => expect(y.stops[0].platform.station.label).toBe('Pri kríži'))
        
        lineStop = r1[0].stops[0]
    })
    
    test('check getDepartures() works', async () => {
        if (lineStop) {
            const x = await getDepartures(lineStop)
            expect(x[0].id).toBe(1)
            expect(x[0].platform.station.label).toBe('Pri kríži')
            expect(timePrettyFormat(x[0].departure)).toBe('04:36')
            firstDeparture = x[0]
        } else {
            throw new Error('lineStop is not available')
        }
    })
    
    test('check getLineSchedule() works', async () => {
        if (firstDeparture) {
            const x = await getLineSchedule(firstDeparture)
            x.stops.forEach(y => {
                console.log(`${y.platform.station.label.padStart(24, ' ')} ${y.platform.label} ${timePrettyFormat(y.departure)}`)
            })
            expect(x.stops[0].platform.station.label).toBe('Pri kríži')
            expect(x.stops[0].platform.label).toBe('A')
            expect(timePrettyFormat(x.stops[0].departure)).toBe('04:36')
            expect(timePrettyFormat(x.stops[2].departure)).toBe('04:37')
        } else {
            throw new Error('firstDeparture is not available')
        }
    })
})
