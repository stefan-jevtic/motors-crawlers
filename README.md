# Motors Crawlers

## Docs about setting-up this project and folders structure of mechanism

1. Setting-up steps:
    - Install all dependencies, run `npm install`
    - Install anticaptcha extension to chromium a guidance could be found here: [antcpt.com](https://antcpt.com/eng/download/google-chrome-options.html)
    - Set path to manifest.json of installed extension to chrome.js class
    - Find config.js in js folder of installed extension and change account key value to your api key so chromium can load it on start
    - Set database parameters for your mysql server in ./Models/index.js
    
## Folder structure of project

Directory tree of project:
```
├── common
├── Models
├── Scrapers
│   └── mobile-de
├── Server
│   ├── DB
│   └── Engine
└── Workers

```

All scraping logic are written in 3 folders: Scrapers, Server and Workers

### Scrapers folder:
```
Scrapers
└── mobile-de
    ├── detail.js
    ├── listing.js
    └── mobilede.js
```

This folder contains folder of each website which you want to scrape\
**_NOTE:_ When you create a new crawler the main folder _MUST_ be named as crawler in database, this stands for dynamically running crawlers from only two workers.**\
**_NOTE:_ New crawler _MUST_ contain three files inside folder: `detail.js` for detail crawler, `listing.js` for listing crawler and file named as spider for a super class.**

### Server folder:
```
Server
├── DB
│   └── DB.js
└── Engine
    ├── Chrome.js
    ├── Engine.js
    ├── Request.js
    └── UserAgents.js
```

This folder is charge for database communication and sending request logic\
`DB.js` contains queries for database communication\
`Engine.js` Engine class that manipulates way of sending request. It can be as simple request or using chromium\
`Request.js` Request class for sending simple requests\
`Chrome.js` Chromium browser for parsing javascript-heavy websites\
`UserAgents.js` contains 10 most common User Agents

### Workers folder:
```
Workers
├── detail.worker.js
└── listing.worker.js
```

This folder holds two workers, one for each type of crawlers\
`detail.worker.js` controls detail crawler\
`listing.worker.js` controls listing crawler

~~**_NOTE:_ Uncomment lines of code that are commented when you properly configure .env file and you want to use environment variables,
also uncomment lines that contains slack api implementation when you set-up slack webhook in .env file.**~~

## Run crawler with:
`node run.js <SPIDER> <TYPE> <ENGINE>`
*Example:*
`node run.js mobile-de detail Chrome`
