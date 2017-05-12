"use strict";

const fs = require("fs");
const mo = require("moment");
const qs = require("querystring");
const request = require("request");

const URL_CATS = "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?"; // category=N
const NUM_CATEGORIES = 37;

const TIME_INIT = Date.now();

const PROXIES_FILE = process.argv[2] || "plist.tsv";
const GOOD_PROXIES_FILE = process.argv[3] || "plistb.tsv";

const proxySet = new Set(fs.readFileSync(PROXIES_FILE, "utf8").split("\n"));
const validProxySet = new Set();

process.on('SIGINT', saveProxies);
process.on('uncaughtException', (err) => { log(err.name) });

for (let proxy of proxySet){
  try{
    checkProxy(proxy);
  } catch (e){}
}

function checkProxy(proxy){
  const url = URL_CATS + qs.stringify({category: Math.floor(Math.random()*(NUM_CATEGORIES+1))});
  request(url, {proxy: proxy}, (err, resp, body) => {
    if (err || resp.statusCode !== 200) return;
    let res = JSON.parse(body);
    if (res.alpha.length > 0){
      log(proxy);
      validProxySet.add(proxy);
    }
  });
}

function log(){
  const time = mo(Date.now() - TIME_INIT).format("m[m]ss");
  const strObj = (el) => (typeof el === "object") ? JSON.stringify(el) : el;
  console.log(time + " " + [].slice.call(arguments).map(strObj).join(" "));
}

function saveProxies() {
  fs.writeFileSync(GOOD_PROXIES_FILE, Array.from(validProxySet).join("\n"));
  console.log("\nDumped logged proxies to file " + GOOD_PROXIES_FILE);
  process.exit();
}
