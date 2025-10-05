export interface LineDeparture {
    StopPoleCode: string
    Departure?: number
    DepartureDisplay?: string
    Arrival?: number
    ArrivalDisplay?: string
}

export interface LineDeparturesObject {
    [stop: string]: LineDeparture
}

export type LineDeparturesJson = [LineDeparturesObject, any[], any[], string, number, any, any, string, string, any[]]
