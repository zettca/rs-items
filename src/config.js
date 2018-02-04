const config = {
  URL_BASE: 'http://services.runescape.com/m=itemdb_rs/api/catalogue/',
  URL_CATS: 'category.json?', // category=N
  URL_ITEMS: 'items.json?', // category=N&alpha=C&page=N
  NUM_CATEGORIES: 37,
  NUM_ITEMS_PER_PAGE: 12,

  TIMEOUT: 5 * 1000,
  TIME_LOOP: 2 * 1000,
  MAX_ALLOWED_FAILS: 2,
};

export default config;
