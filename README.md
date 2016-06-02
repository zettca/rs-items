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
 
### Usage
* Run `index.js` with an optional filename parameter. Filename defaults to `timestamp`
```shell
node index.js [FILENAME]
```
* Wait for about **50-60 minutes** for the script to GET all the items.
This is because the API will block if too many requests are made.
Requests can only be made about every *4 to 5 seconds*, and there are about *750 requests* to be made.
The output will be dumped to `dumps` in `TSV`, `CSV` and `JSON` formats, as follows:
```text
FILENAME.json
FILENAME.tsv
FILENAME.csv
```
