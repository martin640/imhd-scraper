import { getDepartures, getLine, getLines, getLineSchedule, LineStop, LineStopWithDeparture } from '../src'
import { timePrettyFormat } from '../src/util'

describe('testing index file', () => {
    let lineStop: LineStop | null = null
    let firstDeparture: LineStopWithDeparture | null = null
    
    test('check getLines() works', (done) => {
        getLines()
            .then(x => {
                expect(x.length).toBeGreaterThan(100)
            })
            .finally(done)
    })
    
    test('check getLineByNumber(4) works', (done) => {
        getLine('4', { lastStop: 'Zlaté piesky' })
            .then(x => {
                x.forEach(y => {
                    expect(y.stops[y.stops.length - 1].platform.station.label).toBe('Zlaté piesky')
                })
                
                lineStop = x[0].stops[0]
            })
            .finally(done)
    })
    
    test('check getDepartures() works', (done) => {
        if (lineStop) {
            getDepartures(lineStop)
                .then(x => {
                    expect(x[0].id).toBe(1)
                    expect(x[0].platform.station.label).toBe('Pri kríži')
                    expect(timePrettyFormat(x[0].departure)).toBe('04:36')
                    firstDeparture = x[0]
                })
                .finally(done)
        } else {
            throw new Error('lineStop is not available')
        }
    })
    
    test('check getLineSchedule() works', (done) => {
        if (firstDeparture) {
            getLineSchedule(firstDeparture)
                .then(x => {
                    x.stops.forEach(y => {
                        console.log(`${y.platform.station.label.padStart(24, ' ')} ${y.platform.label} ${timePrettyFormat(y.departure)}`)
                    })
                    expect(x.stops[0].platform.station.label).toBe('Pri kríži')
                    expect(x.stops[0].platform.label).toBe('A')
                    expect(timePrettyFormat(x.stops[0].departure)).toBe('04:36')
                })
                .finally(done)
        } else {
            throw new Error('firstDeparture is not available')
        }
    })
})
