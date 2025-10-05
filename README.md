
# imhd-scraper


![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/martin640/imhd-scraper/test.yml?label=tests)
 ![NPM Version](https://img.shields.io/npm/v/imhd-scraper)
 [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) 

Library for scraping public transport departures from imhd.sk website


## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

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


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Contributing

Contributions are always welcome!
