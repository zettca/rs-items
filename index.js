"use strict";

var fs = require("fs");
var qs = require("querystring");
var request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const URL_ITEMS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?"; // category=N&alpha=C&page=N
const ALPHAS = "#abcdefghijklmnopqrstuvwxyz";
const NUM_CATEGORIES = 37;

const sec = 1000;
const TIME_INIT = Date.now();
var DELAY_ITER = 4*sec;
var DELAY_WAIT = 40*sec;

const outFile = process.argv[2] || TIME_INIT || "dump";

process.on('SIGINT', function(){
  dumpToFile(outFile);
  process.exit();
});

var itemList = {};
requestCatAvailables(0);  // category to start from

/* ========== AUXILIARY STUFFY ========== */

function dumpToFile(filename){
  let tsv = "ID\tName", csv = "ID,Name";
  
  for (let prop in itemList){
    tsv += prop + '\t' + itemList[prop] + '\n';
    csv += prop + ',' + itemList[prop] + '\n';
  }
  
  log("Dumping ItemList to files...");
  fs.writeFileSync("dumps/"+filename+".tsv", tsv);
  fs.writeFileSync("dumps/"+filename+".csv", csv);
  fs.writeFileSync("dumps/"+filename+".json", JSON.stringify(itemList, null, '\t'));
  log("Dumping finished. Bye!");
}

function requestCatAvailables(cat){
  let query = { category: cat};
  let url = URL_CATS+qs.stringify(query);
  let alphas = "";
  
  if (cat > NUM_CATEGORIES){
    dumpToFile(outFile);
    return;
  }
  
  request(url, function(err, res, body){
      if (!err && res.statusCode == 200){
        try{
          log("GOT: " + JSON.stringify(query));
          let obj = JSON.parse(body);
          
          for (let el of obj.alpha)
            if (el.items > 0)
              alphas += el.letter;
          
          requestCatItems(cat, alphas, 1); // get items from available alphas
          
        } catch (e){
          log("ERR: " + JSON.stringify(query));
          log(e.name+". Too many requests? Waiting for "+DELAY_WAIT/1000+" seconds...");
          setTimeout(requestCatAvailables, DELAY_WAIT, cat);
        }
      }
  });
}

function requestCatItems(cat, alphas, page){
  let query = { category: cat, alpha: alphas[0], page: page};
  let url = URL_ITEMS+qs.stringify(query);
  
  request(url, function(err, res, body){
    if (!err && res.statusCode == 200){
      
      try{
        log("GOT: " + JSON.stringify(query));
        let obj = JSON.parse(body);
        
        for (let i=0; i<obj.items.length; i++){
          let item = obj.items[i];
          itemList[item.id] = item.name;
        }
        
        if (obj.items.length === 12){ // go next page
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas, page+1);
        } else if (alphas.length > 1){ // go next char
          setTimeout(requestCatItems, DELAY_ITER, cat, alphas.substring(1), 1);
        } else if (alphas.length === 1){ // go next cat
          requestCatAvailables(cat+1);
        }
        
      } catch (e){ // shitty API refused to give infos back.
        log("ERR: " + JSON.stringify(query));
        log(e.name+". Too many requests? Waiting for "+DELAY_WAIT/1000+" seconds...");
        setTimeout(requestCatItems, DELAY_WAIT, cat, alphas, page);
      }
      
    }
  });
}

function log(msg){
  let timeF = "0000" + Math.floor((Date.now() - TIME_INIT) / 1000);
  let timeC = timeF.substring(timeF.length-4);
  console.log(timeC + " " + msg);
}
