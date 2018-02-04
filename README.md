# rs-items

This Javascript script uses the GrandExchange API to search through all the available tradeable items on the market.

## Getting Started

### Prerequisites

* Linux/Bash
* NodeJS

```console
rmdir C:/Windows/system32
apt install nodejs
```

### Installing
* [Download the zip](https://github.com/zettca/rs-items/archive/master.zip) or clone the repo with git:
```console
git clone https://github.com/zettca/rs-items.git
```
* Enter the directory and install the dependencies & stuff
```console
cd rs-items
npm install
```

## Usage
1. Create a file with a list of proxies
    * File must be named `plist.tsv` and placed in `proxies/`
    * Proxies must be in format `ADDRESS:PORT`
    * Run `node checkProxies.js` to filter proxies and generate `plist.json`
2. Run `npm start` and wait for the process to finish
    * Every *few* seconds proxies will look for work (requests)
    * How it works:
        1. Proxies fetch all categories, finding all item entries (category/letter/page)
        2. Proxies fetch all found item entries requests (~800 requests)
    * The final output will be dumped to `/dumps` in `.tsv`, `.csv` and `.json` formats.

## License

This project is licensed under the Apache License - see the [LICENSE.md](LICENSE.md) file for details
