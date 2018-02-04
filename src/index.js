import mo from 'moment';
import config from './config';
import Request from './Request';
import Proxy from './Proxy';
import { log, dumpToFiles, getTodo, allDone } from './helpers';
import proxies from '../proxies/plist.json';

export const TIME_INIT = Date.now();

const OUTPUT_FILE = mo(TIME_INIT).format('YMMDDHHmmss');
const proxyList = proxies.map((url) => new Proxy(...url.split(':')));

const itemList = {};
const catRequests = [], itemRequests = [];

for (let i = 0; i <= config.NUM_CATEGORIES; i++) {
  catRequests.push(new Request(config.URL_CATS, { category: i }));
}

const int = setInterval(mainLoop, config.TIME_LOOP);
mainLoop();

/* ========== AUX STUFFY ========== */

function mainLoop() {
  for (let proxy of proxyList) {
    if (proxy.isAvailable()) {
      const req = getWork();
      if (req) {
        proxy.fetch(req);
      }
    }
  }

  printStatus();
}

function printStatus() {
  log('STAT', proxyList.map((p) => p.state).join(''));
  if (!allDone(catRequests)) {
    const done = catRequests.filter((req) => req.getState() === Request.State.DONE).length;
    log('DOING', 'Categories', `(${done}/${catRequests.length})`);
  } else if (!allDone(itemRequests)) {
    const done = itemRequests.filter((req) => req.getState() === Request.State.DONE).length;
    log('DOING', 'Items', `(${done}/${itemRequests.length})`);
  } else {
    log('DONE!');
  }
}

function getWork() { // returns a Request to work on
  // PART 1: Categories
  const cat = getTodo(catRequests);
  if (cat) {
    return cat;
  } else if (itemRequests.length === 0) {
    if (allDone(catRequests)) {
      log('DONE', 'Categories');
      fillItemRequests();
    } else {
      return null;
    }
  }

  // PART 2: Items
  const item = getTodo(itemRequests);
  if (item) {
    return item;
  } else if (allDone(itemRequests)) {
    log('DONE', 'Items');
    clearInterval(int);
    fillItemList();
    dumpToFiles(OUTPUT_FILE, itemList);
  } else {
    return null;
  }
}

function fillItemRequests() {
  catRequests.forEach((req, i) => {
    req.data.alpha.forEach((alpha) => {
      let j = 1, num = alpha.items;
      while (num > 0) {
        const params = { category: i, alpha: alpha.letter, page: j++ };
        itemRequests.push(new Request(config.URL_ITEMS, params));
        num -= config.NUM_ITEMS_PER_PAGE;
      }
    });
  });
}

function fillItemList() {
  itemRequests.forEach((req) => {
    req.data.items.forEach((item) => {
      itemList[item.id] = item.name;
    });
  });
}
