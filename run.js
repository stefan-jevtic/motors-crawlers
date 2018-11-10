const autoloader = require('auto-loader');
if(process.argv.length !== 5)
    throw new Error('Wrong number of arguments! Expect 3: <SPIDER> <TYPE> <ENGINE>')
const spider = process.argv[2];
const worker = process.argv[3];
const engine = process.argv[4];
if(!(spider in autoloader.load(`${__dirname}/Scrapers/`)))
    throw new Error(`Spider ${spider} does not exist`);
if(engine !== 'Chrome' && engine !== 'Request')
    throw new Error('Wrong type of engine! Available: Chrome or Request')
if(worker !== 'listing' && worker !== 'detail')
    throw new Error('Worker does not exist! Available: detail or listing')
const Worker = autoloader.load(`${__dirname}/Workers/`)[`${worker}.worker`];

const w = new Worker(spider, engine);
w.crawl()
.catch(err => console.log(err));