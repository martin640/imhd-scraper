export interface StationPlatform {
    id: number
    label: string
    coordinates: [number, number]
    station: Station
}

export interface Station {
    id: number
    label: string
    coordinates: [number, number]
    platforms: StationPlatform[]
}

export interface Vehicle {
    id: number
    label: string
}

export interface LineStop {
    id: number
    platform: StationPlatform
    line: Line
    hrefDetails: string
}

export interface LineStopWithDeparture extends LineStop {
    departure: number
    hrefDetails: string
}

export interface Line {
    label: string
    stops: LineStop[]
}

export interface ScheduledLine {
    id: number
    label: string
    stops: LineStopWithDeparture[]
}

export interface LiveLineStop extends LineStopWithDeparture {
    delay: number
}

export interface LiveLine extends ScheduledLine {
    vehicle: Vehicle
    current_stop: LiveLineStop
}

export interface BaseQueryOptions {
    cityCode?: string
}

export interface LineQueryOptions extends BaseQueryOptions {
    via?: string | string[]
    firstStop?: string | string[]
    lastStop?: string | string[]
}
