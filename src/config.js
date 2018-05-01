const RS3 = {
  URL_BASE: 'http://services.runescape.com/m=itemdb_rs/api/catalogue/',
  URL_CATS: 'category.json?', // category=N
  URL_ITEMS: 'items.json?', // category=N&alpha=C&page=N
  NUM_CATEGORIES: 37,
  NUM_ITEMS_PER_PAGE: 12,
};

const OSRS = {
  URL_BASE: 'http://services.runescape.com/m=itemdb_oldschool/api/catalogue/',
  URL_CATS: 'category.json?', // category=N
  URL_ITEMS: 'items.json?', // category=N&alpha=C&page=N
  NUM_CATEGORIES: 1,
  NUM_ITEMS_PER_PAGE: 12,
};

const config = {
  TIMEOUT: 5 * 1000,
  TIME_LOOP: 2 * 1000,
  TIME_WAIT: 2 * 1000,
  MAX_ALLOWED_FAILS: 2,
  API: RS3
};

export default config;
