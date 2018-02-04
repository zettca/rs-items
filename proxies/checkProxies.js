"use strict";

const fs = require("fs");
const mo = require("moment");
const axios = require("axios");

const TIME_INIT = Date.now();
const PROXIES_FILE = process.argv[2] || "plist.tsv";
const GOOD_PROXIES_FILE = process.argv[3] || "plist.json";

const proxySet = new Set(fs.readFileSync(PROXIES_FILE, "utf8").split("\n"));
const validProxySet = new Set();

process.on('SIGINT', saveProxies);
process.on('uncaughtException', (err) => { log(err.name); });

for (let proxy of proxySet) {
  checkProxy(proxy);
}

function checkProxy(proxy) {
  const url = "http://services.runescape.com/m=itemdb_rs/api/info.json";
  const pArgs = proxy.split(':');

  axios.get(url, { proxy: { host: pArgs[0], port: pArgs[1] } })
    .then((res) => {
      const data = res.data;
      if (data && data.hasOwnProperty('lastConfigUpdateRuneday')) {
        log(`OK ${proxy}`);
        validProxySet.add(proxy);
      }
    })
    .catch((err) => {
      log(`KO ${proxy}`);
    });
}

function log() {
  const time = mo(Date.now() - TIME_INIT).format("m[m]ss");
  const strObj = (el) => (typeof el === "object") ? JSON.stringify(el) : el;
  console.log(time + " " + [].slice.call(arguments).map(strObj).join(" "));
}

function saveProxies() {
  const data = JSON.stringify(Array.from(validProxySet), null, 2);
  fs.writeFileSync(GOOD_PROXIES_FILE, data);
  console.log("\nDumped logged proxies to file " + GOOD_PROXIES_FILE);
  process.exit();
}
