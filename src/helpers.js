import fs from 'fs';
import moment from 'moment';
import Request from './Request';
import { TIME_INIT } from './index';

export function allDone(reqArray) {
  return reqArray.every((req) => req.getState() === Request.State.DONE);
}

export function getTodo(reqArray) {
  return reqArray.find((req) => req.getState() === Request.State.TODO);
}

export function log() {
  const strObj = (el) => (typeof el === 'object') ? JSON.stringify(el) : el;
  const time = moment(Date.now() - TIME_INIT).format('m[m]ss');
  console.log(time + ' ' + [].slice.call(arguments).map(strObj).join(' '));
}

export function dumpToFiles(filename, items) {
  const dumpSplitFormat = (sep) => {
    let res = 'ID' + sep + 'Name\n';
    for (let id in items) res += id + sep + items[id] + '\n';
    return res;
  };

  fs.writeFileSync('dumps/csv/' + filename + '.csv', dumpSplitFormat(','));
  fs.writeFileSync('dumps/tsv/' + filename + '.tsv', dumpSplitFormat('\t'));
  fs.writeFileSync('dumps/json/' + filename + '.json', JSON.stringify(items, null, '\t'));
  log('Items successfully dumped to files.');
  process.exit();
}
