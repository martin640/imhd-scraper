import axios from 'axios'
import parse from 'node-html-parser'
import { BaseQueryOptions, Line, LineQueryOptions, LineStop, LineStopWithDeparture, ScheduledLine } from './types/lib'
import { loadVarsFromEval } from './util'
import { LineDeparturesJson } from './types/api'

let timezoneOffset = 0
let cityCode: string = 'ba'

export const setDefaultCityCode = (c: string) => {
    cityCode = c
}

export const setTimezoneOffset = (n: number) => {
    timezoneOffset = n
}

export const getLines = async (query?: BaseQueryOptions): Promise<string[]> => {
    const html = (await axios.get(`https://imhd.sk/${query?.cityCode || cityCode}/cestovne-poriadky`, { responseType: 'text' })).data as string
    const document = parse(html)
    return document.querySelectorAll('.Linka--lg').map(x => x.innerText)
}

export const getLine = async (lineNumber: string, query?: LineQueryOptions): Promise<Line[]> => {
    const html = (await axios.get(`https://imhd.sk/${query?.cityCode || cityCode}/linka/${lineNumber.replace(' ', '-')}`, { responseType: 'text' })).data as string
    const document = parse(html)
    let lines: Line[] = []
    
    const directions = document.querySelectorAll('.stopsList:not(#trasa-spoja) .table-striped tbody')
    directions.forEach(x => {
        const stops = x.getElementsByTagName('tr')
        let stopsBuffer: { data: LineStop, routes: number[] }[] = []
        let routes: number[] = []
        
        stops.forEach((y, i) => {
            const columns = y.querySelectorAll('td')
            if (columns.length < 2) return
            
            const label = columns[1].innerText || ''
            const rowRoutes = y.getAttribute('data-rvs')!.replace(/[\[\]]/g, '').split(',').map(Number)
            rowRoutes.forEach(x => {
                if (!routes.includes(x)) routes.push(x)
            })
            
            stopsBuffer.push({
                data: {
                    id: i + 1,
                    platform: {
                        id: Number(y.getAttribute('data-gspuv')),
                        label: label,
                        coordinates: [0, 0],
                        station: {
                            id: Number(y.getAttribute('data-gsuv')),
                            label: label,
                            coordinates: [0, 0],
                            platforms: []
                        }
                    },
                    line: { label: '', stops: [] },
                    hrefDetails: columns[1].querySelector('a')?.getAttribute('href') || ''
                },
                routes: rowRoutes
            })
        })
        
        routes.forEach(route => {
            const routeStops = stopsBuffer.filter(y => y.routes.includes(route))
            
            if (query) {
                if ((typeof query.via === 'string') && !routeStops.find(y => y.data.platform.label === query.via)) return
                else if (Array.isArray(query.via) && !query.via.every(y => routeStops.find(z => z.data.platform.label === y))) return
                
                if ((typeof query.firstStop === 'string') && (routeStops[0]?.data?.platform?.label !== query.firstStop)) return
                else if (Array.isArray(query.firstStop) && !query.firstStop.includes(routeStops[0]?.data?.platform?.label)) return
                
                if ((typeof query.lastStop === 'string') && (routeStops[routeStops.length - 1]?.data?.platform?.label !== query.lastStop)) return
                else if (Array.isArray(query.lastStop) && !query.lastStop.includes(routeStops[routeStops.length - 1]?.data?.platform?.label)) return
            }
            
            const line: Line = {
                label: document.querySelector('.Linka--xl')?.innerText || '',
                stops: routeStops.map(y => y.data).map(y => ({ ...y }))
            }
            line.stops.forEach(x => x.line = line)
            lines.push(line)
        })
    })
    
    return lines
}

export const getDepartures = async (stop: LineStop): Promise<LineStopWithDeparture[]> => {
    const html = (await axios.get(`https://imhd.sk${stop.hrefDetails}`, { responseType: 'text' })).data as string
    const document = parse(html)
    const departures: LineStopWithDeparture[] = []
    
    const timetables = document.querySelectorAll('.TimetableTimes')
    const vars = loadVarsFromEval<{ set: { [k: string]: number } }>(document.querySelector('#calendarBlock + script')?.textContent || '')
    const prefix = /^\/(\w+)\//g.exec(stop.hrefDetails)?.[1] || ''
    
    // for now, we are going to use only the first timetable
    const rows = timetables[0].querySelectorAll('tr')
    rows.forEach(x => {
        const hour = x.querySelector('th')!.innerText
        const minutes = x.querySelectorAll('td')
        minutes.forEach(y => {
            const minute = y.innerText.replace(/\D/g, '')
            const time = new Date
            time.setHours(Number(hour), Number(minute), 0, 0)
            // sm14 T 11293542   T 0 T 62051   T 1 T 15673177
            const idParts = y.id.split('T')
            
            const dis = '1'
            const iddis = idParts[idParts.length - 1]
            const set = vars.set?.[idParts[3]] || 0
            const trip = idParts[1]
            
            departures.push({
                ...stop,
                departure: time.getTime() - timezoneOffset,
                hrefDetails: `/${prefix}/nacitaj-odchody-spojov?dis=${dis}&iddis=${iddis}&set=${set}&trip=${trip}&tzo=&tz=&diy=&ad=0&db=`
            })
        })
    })
    
    return departures
}

export const getLineSchedule = async (scheduledDeparture: LineStopWithDeparture): Promise<ScheduledLine> => {
    const json = (await axios.get(`https://imhd.sk${scheduledDeparture.hrefDetails}`, { responseType: 'text' })).data as string
    const data = JSON.parse(json) as LineDeparturesJson
    const departures = data[0]
    const outputDepartures: LineStopWithDeparture[] = []
    const today = new Date
    today.setHours(0, 0, 0, 0)
    
    Object.entries(departures).forEach(([stopId, details]) => {
        const stop = scheduledDeparture.line.stops.find(x => x.id === Number(stopId))
        if (stop) {
            const dep: LineStopWithDeparture = {
                ...stop,
                departure: today.getTime() - timezoneOffset + (((typeof details.Departure !== 'undefined') ? details.Departure : ((typeof details.Arrival !== 'undefined') ? details.Arrival : 0)) * 1000),
                // todo: we don't have data to build this url, we can use scheduledDeparture.hrefDetails calling getDepartures() will yield incorrect departure times
                hrefDetails: scheduledDeparture.hrefDetails
            }
            dep.platform.label = details.StopPoleCode
            outputDepartures.push(dep)
        } else {
            throw new Error(`Failed to build line schedule: stop with index ${stopId} not found`)
        }
    })
    
    return {
        id: 0,
        label: scheduledDeparture.line.label,
        stops: outputDepartures
    }
}

export * from './types/lib'
export { timePrettyFormat } from './util'
