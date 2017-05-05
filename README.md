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
1. Run `node items.js` with an optional *FILENAME* parameter.
2. Wait for about **50-60 minutes** for the script to GET all the items.
    * This is because the API will block if too many requests are made. Requests can only be made about every *4 to 5 seconds*, and there are about *750 requests* to be made.
    * The output will be dumped to `/dumps` in `.tsv`, `.csv` and `.json` formats.
