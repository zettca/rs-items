# rs-items

This Javascript script uses the GrandExchange API to search through all the available tradeable items on the market.

### Installation
* [Download the zip](https://github.com/zettca/rs-items/archive/master.zip) or clone the repo with git:
```shell
git clone https://github.com/zettca/rs-items.git
```
* Enter the directory and install the dependencies & stuff
```shell
cd rs-items
npm install
```
 
### Usage (items.js)
1. Run `node items.js` with an optional *FILENAME* argument.
2. Wait for about **50-60 minutes** for the script to GET all the items.
    * This is because the API will block if too many requests are made. Requests can only be made about every *4 to 5 seconds*, and there are about *750 requests* to be made.
    * The output will be dumped to `/dumps` in `.tsv`, `.csv` and `.json` formats.

### Usage (itemsp.js)
Alternatively, you may use proxies to avoid getting blocked
1. Create a file with a list of proxies in format `http://ADDRESS:PORT`
2. Run `node itemsp.js` with *FILENAME* and *PROXY-FILENAME* as optional arguments.
    * Each proxy will process a category in parallel.
    * The final output will be dumped to `/dumps` in `.tsv`, `.csv` and `.json` formats.

### Usage (itemspe.js)
Evenly distributed proxy workload
1. Create a file with a list of proxies in format `http://ADDRESS:PORT`
2. Run `node itemspe.js` with *PROXY-FILENAME* and *FILENAME* as optional arguments.
    * Every 5 seconds all proxies will look for work (requests)
    * Firstly, proxies fill a list with items requests from category (~800 requests)
    * Then, they evenly fill the `itemList` by requesting the items
    * The final output will be dumped to `/dumps` in `.tsv`, `.csv` and `.json` formats.
