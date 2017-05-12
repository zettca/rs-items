"use strict";

const fs = require("fs");
const mo = require('moment');
const qs = require("querystring");
const request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const URL_ITEMS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?"; // category=N&alpha=C&page=N
const NUM_CATEGORIES = 37;
const NUM_ITEMS_PER_PAGE = 12;

const TIME_INIT = Date.now();
const DELAY_ITER = 5*1000;
const DELAY_LOOP = DELAY_ITER;
const MAX_ALLOWED_FAILS = 2;

const PROXY_FILE = process.argv[2] || "plist.tsv";
const OUTPUT_FILE = process.argv[3] || mo(TIME_INIT).format("YMMDDHHmmss");

const StateRequest = { TODO: 0, DOING: 1, DONE: 2 };
const StateProxy = {FREE: '✓', BUSY: '•', DEAD: '✕'};

/* ========== CLASSES STUFFY ========== */

class Proxy {
  constructor(url) {
    this.state = StateProxy.FREE;
    this.url = url;
    this.fails = 0;
  }

  setBusy() {
    this.state = StateProxy.BUSY;
  }

  incFails() {
    this.fails++;
    if (this.fails > MAX_ALLOWED_FAILS) this.state = StateProxy.DEAD;
  }

  isAvailable() {
    return this.state === StateProxy.FREE;
  }
}

class Request {
  constructor(query) {
    this.state = StateRequest.TODO;
    this.query = query;
    this.time = TIME_INIT;
  }

  setDoing() {
    this.time = Date.now();
    this.state = StateRequest.DOING;
  }

  setDone() {
    this.time = Date.now();
    this.state = StateRequest.DONE;
  }

  isTimedOut() {
    return Date.now() - this.time > DELAY_ITER;
  }
}

/* ========== MAIN STUFFY ========== */

const itemList = {};
const proxyList = fs.readFileSync(PROXY_FILE, "utf8").split("\n").map((url) => new Proxy(url));

const catStates = [];
const itemListQueries = [];
for (let i = 0; i <= NUM_CATEGORIES; i++) catStates.push(new Request({category: i}));

putProxiesWorking();
let int = setInterval(putProxiesWorking, DELAY_LOOP);

/* ========== AUX STUFFY ========== */

function putProxiesWorking() {
  log("STAT", proxyList.map((p) => p.state).join(""));
  if (!allDone(catStates)) {
    log("DOING", "Categories");
    log("LEFT", catStates.filter((req) => req.state !== StateRequest.DONE).length);
    for (let proxy of proxyList) workCategory(proxy);
  } else if (!allDone(itemListQueries)) {
    log("DOING", "Items");
    log("LEFT", itemListQueries.filter((req) => req.state !== StateRequest.DONE).length);
    for (let proxy of proxyList) workItems(proxy);
  } else {
    log("DONE");
    clearInterval(int);
    dumpToFiles();
  }
}

function workCategory(proxy) {
  if (!proxy.isAvailable()) return;
  let cat = getUndone(catStates);
  if (cat === undefined) return;

  cat.setDoing();
  proxy.setBusy();
  requestCategory(proxy, cat.query.category);
}

function workItems(proxy) {
  if (!proxy.isAvailable()) return;
  let item = getUndone(itemListQueries);
  if (item === undefined) return;

  item.setDoing();
  proxy.setBusy();
  requestItems(proxy, item);
}

/* ========== HELPING STUFFY ========== */

function allDone(reqArray) {
  return reqArray.every((req) => req.state === StateRequest.DONE);
}

function getUndone(reqArray) {
  return reqArray.find((req) => req.state === StateRequest.TODO || req.state === StateRequest.DOING && req.isTimedOut());
}

/* ========== REQUEST STUFFY ========== */

function requestCategory(proxy, cat) {
  const query = { category: cat };
  const url = URL_CATS + qs.stringify(query);
  request(url, { proxy: proxy.url }, (err, resp, body) => {
    //if (err || resp.statusCode !== 200) return;
    try {
      let res = JSON.parse(body);
      for (let al of res.alpha) {
        let i = 1, num = al.items;
        while (num > 0) {
          itemListQueries.push(new Request({ category: cat, alpha: al.letter, page: i++ }));
          num -= NUM_ITEMS_PER_PAGE;
        }
      }
      log("GOT", query, proxy.url);
      proxy.state = StateProxy.FREE;
      catStates[cat].setDone();
    } catch (e) {
      handleError(e, proxy, query);
    }
  });
}

function requestItems(proxy, item) {
  const query = item.query;
  const url = URL_ITEMS + qs.stringify(query);
  request(url, { proxy: proxy.url }, (err, resp, body) => {
    //if (err || resp.statusCode !== 200) return;
    try {
      let res = JSON.parse(body);
      for (let item of res.items) itemList[item.id] = item.name;
      log("GOT", query);
      proxy.state = StateProxy.FREE;
      item.setDone();
    } catch (e) {
      handleError(e, proxy);
    }
  });
}

function handleError(e, proxy) {
  log("ERR", e.name, proxy.url);
  proxy.incFails();
}

/* ========== LOGGING STUFFY ========== */

function log() {
  const strObj = (el) => (typeof el === "object") ? JSON.stringify(el) : el;
  const time = mo(Date.now() - TIME_INIT).format("m[m]ss");
  console.log(time + " " + [].slice.call(arguments).map(strObj).join(" "));
}

function dumpToFiles() {
  const dumpSplitFormat = (sep) => {
    let res = "ID"+sep+"Name\n";
    for (let id in itemList) res += id + sep + itemList[id] + '\n';
    return res;
  };

  fs.writeFileSync("dumps/csv/"+OUTPUT_FILE+".csv", dumpSplitFormat(','));
  fs.writeFileSync("dumps/tsv/"+OUTPUT_FILE+".tsv", dumpSplitFormat('\n'));
  fs.writeFileSync("dumps/json/"+OUTPUT_FILE+".json", JSON.stringify(itemList, null, '\t'));
  log("Items successfully dumped to files.");
  process.exit();
}
