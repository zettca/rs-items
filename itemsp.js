"use strict";

const fs = require("fs");
const mo = require('moment');
const qs = require("querystring");
const request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const URL_ITEMS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?"; // category=N&alpha=C&page=N
const NUM_CATEGORIES = 37;

const TIME_INIT = Date.now();
const DELAY_ITER = 5*1000;
const DELAY_WAIT = 10*DELAY_ITER;

const OUT_FILE = process.argv[3] || mo(TIME_INIT).format("YMMDDHHmmss");
const PROXIES_FILE = process.argv[2] || "plist.tsv";

const State = { TODO: 0, DOING: 1, DONE: 2 };

/* ========== MAIN STUFFY ========== */

process.on('SIGINT', dumpToFiles);

const itemList = {};
const catProxyMap = [];
const catStates = Array(NUM_CATEGORIES+1).fill(State.TODO);

main();

/* ========== AUX STUFFY ========== */

function main(){
  const proxyCats = {};
  const proxyList = fs.readFileSync(PROXIES_FILE, "utf8").split("\n");

  for (let proxy of proxyList) proxyCats[proxy] = [];

  for (let i = 0; i <= NUM_CATEGORIES; i++){
    catProxyMap.push(proxyList[i % proxyList.length]);
    proxyCats[catProxyMap[i]].push(i);
  }

  for (let proxy in proxyCats) assignProxyToNewCat(proxy);
}

function assignProxyToNewCat(proxy){
  let cat = getFreeCat();
  if (cat === null) return;
  catProxyMap[cat] = proxy;
  requestCategory(cat);
}

function getFreeCat(){
  for (let cat in catStates){
    if (catStates[cat] === State.TODO){
      catStates[cat] = State.DOING;
      return cat;
    }
  }
  return null;
}

function dumpToFiles(){
  let tsv = "ID\tName\n", csv = "ID,Name\n";

  for (let id in itemList){
    tsv += id + '\t' + itemList[id] + '\n';
    csv += id + ',' + itemList[id] + '\n';
  }

  fs.writeFileSync("dumps/tsv/"+OUT_FILE+".tsv", tsv);
  fs.writeFileSync("dumps/csv/"+OUT_FILE+".csv", csv);
  fs.writeFileSync("dumps/json/"+OUT_FILE+".json", JSON.stringify(itemList, null, '\t'));
  log("\nItems successfully dumped to files.");
  process.exit();
}

function requestCategory(cat){
  const query = { category: cat };
  const url = URL_CATS + qs.stringify(query);

  let opts = { url: url, proxy: catProxyMap[cat] };
  log("ASSIGN", cat, opts.proxy);
  request(opts, function(err, res, body){
    if (!err && res.statusCode === 200){
      try{
        log("GET", query);
        let alphas = "";
        for (let al of JSON.parse(body).alpha)
          if (al.items > 0)
            alphas += al.letter;

        requestCatItems(cat, alphas, 1);
      } catch (e){
        log("ERR", query);
        log("ERR", e.name, "at", opts.proxy, "Waiting "+DELAY_WAIT/1000+" seconds...");
        setTimeout(requestCategory, DELAY_WAIT, cat);
      }
    }
  });
}

function requestCatItems(cat, alphas, page){
  const query = { category: cat, alpha: alphas[0], page: page };
  const url = URL_ITEMS + qs.stringify(query);

  let opts = { url: url, proxy: catProxyMap[cat] };
  request(opts, function(err, res, body){
    if (!err && res.statusCode === 200){
      try{
        log("GET", query);
        let items = JSON.parse(body).items;

        for (let item of items){
          itemList[item.id] = item.name;
        }

        if (items.length >= 12){ // go next page
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas, page+1);
        } else if (alphas.length > 1){ // go next alpha
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas.substring(1), 1);
        } else if (alphas.length === 1){ // go next category
          log("FIN", cat, opts.proxy);
          catStates[cat] = State.DONE;
          log(catStates.join(""));
          (catStates.every((el) => el === State.DONE)) ? dumpToFiles() : assignProxyToNewCat(opts.proxy);
        }
      } catch (e){
        log("ERR", query);
        log("ERR", e.name, "at", opts.proxy, "Waiting "+DELAY_WAIT/1000+" seconds...");
        setTimeout(requestCatItems, DELAY_WAIT, cat, alphas, page);
      }
    }
  });
}

function log(){
  const time = mo(Date.now() - TIME_INIT).format("m[m]ss");
  const strObj = (el) => (typeof el === "object") ? JSON.stringify(el) : el;
  console.log(time + " " + [].slice.call(arguments).map(strObj).join(" "));
}
