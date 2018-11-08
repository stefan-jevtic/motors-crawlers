
/**
 * run: to run worker: node run.js mobile-de test Chrome , first argument is spider, second is name of worker, and thrid engine type
 * */
const autoloader = require('auto-loader');
const spider = process.argv[2];
const worker = process.argv[3];
const engine = process.argv[4];
const Worker = autoloader.load(`${__dirname}/Workers/${spider}/`)[`${worker}.worker`];

const w = new Worker(spider, engine);
w.crawl()
.catch(err => console.log(err));