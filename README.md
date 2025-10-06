
# imhd-scraper


![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/martin640/imhd-scraper/test.yml?label=tests)
 ![NPM Version](https://img.shields.io/npm/v/imhd-scraper)
 [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) 

Library for scraping public transport departures from imhd.sk website


## Installation

To install the library, run:

```sh
$ npm i imhd-scraper
```

Or if you prefer using Yarn:

```sh
$ yarn add imhd-scraper
```


## Usage

```javascript
import { getLine, getDepartures, getLineSchedule, timePrettyFormat } from 'imhd-scraper'

async function main() {
    const line = (await getLine('4', { lastStop: 'Zlaté piesky' }))[0]
    const firstStop = line.stops[0]
    const firstDeparutre = (await getDepartures(firstStop))[0]
    const schedule = getLineSchedule(firstDeparutre)
    schedule.stops.forEach(y => {
        // y.departure here is a timestamp of departure (or arrival in case of a final stop)
        console.log(`${y.platform.station.label.padStart(24, ' ')} ${y.platform.label} ${timePrettyFormat(y.departure)}`)
    })
}
```

If you want to get schedules of other cities, you can switch the city code with `setDefaultCityCode('code')` function or pass `{ cityCode: 'code' }` to functions that accept query options. Example:

```javascript
import { getLine, setDefaultCityCode } from 'imhd-scraper'

async function main() {
    setDefaultCityCode('ke') // Kosice, will be used as default if cityCode in the query options is not set
    
    // Trencin
    const line = (await getLine('2', { cityCode: 'tn', lastStop: 'OC City Park' }))[0]
    ...
}
```


## API


### `getLines(query?: BaseQueryOptions): Promise<string[]>`

Retrieves all operated lines. Use the `query` argument to specify the imhd.sk city code.


### `getLine(lineNumber: string, query?: LineQueryOptions): Promise<Line[]>`

Retrieves all routes for the specified line. The number of routes varies based on starting and terminus points. Use the `query` argument to retrieve a specific route, for example:

```javascript
import { getLine, setDefaultCityCode } from 'imhd-scraper'

async function main() {
    // should return 1 route
    const routes = await getLine('4', { firstStop: 'Pri kríži', lastStop: 'Zlaté piesky' })
    const line = routes[0]
}
```

The `query` parameter supports even more complex filters. Note: `via` performs *AND* filter while `firstStop` and `lastStop` perform *OR* filter.

```javascript
import { getLine, setDefaultCityCode } from 'imhd-scraper'

async function main() {
    // should return 2 routes servicing stop Magnetová: Pri kríži->Zlaté piesky, Zlaté piesky->Pri kríži
    const routes = await getLine('4', { via: 'Magnetová' })
    
    // should return 0 routes because none service both Magnetová and Stn. Nové Mesto
    const routes = await getLine('4', { via: ['Magnetová', 'Stn. Nové Mesto'] })
    
    // should return 2 routes terminating at either Zlaté piesky or Stn. Nové Mesto
    const routes = await getLine('4', { lastStop: ['Zlaté piesky', 'Stn. Nové Mesto'] })
}
```


### `getDepartures(stop: LineStop): Promise<LineStopWithDeparture[]>`

Retrieves all departures from the specified stop. Since `LineStop` includes line direction, only departures in that direction are returned.


### `getLineSchedule(scheduledDeparture: LineStopWithDeparture): Promise<ScheduledLine>`

The result from `getDepartures()` can be used to retrieve departures for all stops along the route at a given time.

```javascript
import { getLine, setDefaultCityCode } from 'imhd-scraper'

async function main() {
    const routes = await getLine('4', { firstStop: 'Pri kríži', lastStop: 'Zlaté piesky' })
    const line = routes[0]
    const firstStop = line.stops[0]
    
    const departures = await getDepartures(firstStop)
    const firstDeparture = departures[0] // should be 04:36
    
    const schedule = await getLineSchedule(firstDeparture)
    const thirdStopDeparture = new Date(schedule.stops[2].departure) // departure from Drobného should be 04:37
}
```


### `timePrettyFormat(t: number): string`

Utility function that converts milliseconds (since midnight or Unix timestamp) to HH:mm format.


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Contributing

Contributions are always welcome!
