"use strict";

const fs = require("fs");
const mo = require('moment');
const qs = require("querystring");
const request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const URL_ITEMS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?"; // category=N&alpha=C&page=N
const NUM_CATEGORIES = 37;

const TIME_INIT = Date.now();
const DELAY_ITER = 4*1000;
const DELAY_WAIT = 10*DELAY_ITER;

const OUT_FILE = process.argv[2] || mo(TIME_INIT).format("YMMDDHHmmss");

process.on('SIGINT', dumpToFiles);

const itemList = {};
requestCategory(0);  // category to start from

/* ========== AUXILIARY STUFFY ========== */

function dumpToFiles(){
  let tsv = "ID\tName\n", csv = "ID,Name\n";

  for (let id in itemList){
    tsv += id + '\t' + itemList[id] + '\n';
    csv += id + ',' + itemList[id] + '\n';
  }

  log("Dumping items to files...");
  fs.writeFileSync("dumps/tsv/"+OUT_FILE+".tsv", tsv);
  fs.writeFileSync("dumps/csv/"+OUT_FILE+".csv", csv);
  fs.writeFileSync("dumps/json/"+OUT_FILE+".json", JSON.stringify(itemList, null, '\t'));
  log("Dumping done. Bye!");
  process.exit();
}

function requestCategory(cat){
  const query = { category: cat };
  const url = URL_CATS + qs.stringify(query);
  let alphas = "";

  if (cat > NUM_CATEGORIES) dumpToFiles();

  request(url, function(err, res, body){
    if (!err && res.statusCode === 200){
      try{
        log("GOT", JSON.stringify(query));

        for (let al of JSON.parse(body).alpha)
          if (al.items > 0)
            alphas += al.letter;
        log("GOT ALPHAS ", alphas);

        requestCatItems(cat, alphas, 1);

      } catch (e){
        log("ERR", JSON.stringify(query));
        log(e.name, "Waiting "+DELAY_WAIT/1000+" seconds...");
        setTimeout(requestCategory, DELAY_WAIT, cat);
      }
    }
  });
}

function requestCatItems(cat, alphas, page){
  const query = { category: cat, alpha: alphas[0], page: page };
  const url = URL_ITEMS + qs.stringify(query);

  request(url, function(err, res, body){
    if (!err && res.statusCode === 200){

      try{
        log("GOT", JSON.stringify(query));
        let items = JSON.parse(body).items;

        for (let item of items){
          itemList[item.id] = item.name;
        }

        if (items.length >= 12){ // go next page
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas, page+1);
        } else if (alphas.length > 1){ // go next alpha
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas.substring(1), 1);
        } else if (alphas.length === 1){ // go next category
          requestCategory(cat+1);
        }

      } catch (e){
        log("ERR", JSON.stringify(query));
        log(e.name, "Waiting "+DELAY_WAIT/1000+" seconds...");
        setTimeout(requestCatItems, DELAY_WAIT, cat, alphas, page);
      }

    }
  });
}

function log(){
  let time = mo(Date.now() - TIME_INIT).format("m[m]ss");
  console.log(time + " " + [].slice.call(arguments).join(" "));
}
