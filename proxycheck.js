"use strict";

const fs = require("fs");
const qs = require("querystring");
const request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const NUM_CATEGORIES = 37;

const PROXIES_FILE = process.argv[3] || "proxies.tsv";
const VALID_PROXIES_FILE = process.argv[2] || "valid-proxies.tsv";

const proxyList = fs.readFileSync(PROXIES_FILE, "utf8").split("\n");
const validProxyList = [];

process.on('SIGINT', saveProxies);

for (let proxy of proxyList){
  const url = URL_CATS + qs.stringify({ category: Math.floor(Math.random()*(NUM_CATEGORIES+1)) });
  const opts = { url: url, proxy: proxy };
  request(opts, function(err, res, body){
    if (!err && res.statusCode === 200){
      try{
        let res = JSON.parse(body);
        if (res.alpha.length > 0) {
          console.log(proxy);
          validProxyList.push(proxy);
        }
      } catch (e){
      }
    }
  });
}

function saveProxies() {
  console.log("Dumping items to files...");
  fs.writeFileSync(VALID_PROXIES_FILE, validProxyList.join("\n"));
  console.log("Dumping done. Bye!");
  process.exit();
}
