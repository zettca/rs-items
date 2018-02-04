import axios from 'axios';
import config from './config';

const StateProxy = { FREE: '_', BUSY: '+', DEAD: '-' };

const axiosI = axios.create({
  timeout: config.TIMEOUT,
  baseURL: config.URL_BASE,
});

class Proxy {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.state = StateProxy.FREE;
    this.fails = 0;
  }

  fetch(request) {
    const { host, port } = this;
    this.state = StateProxy.BUSY;
    request.setDoing();
    axiosI.get(request.path, { proxy: { host, port } })
      .then((res) => {
        request.setData(res.data);
        setTimeout(() => {
          this.state = StateProxy.FREE;
        }, config.DELAY_ITER);
      })
      .catch((err) => {
        //console.log('ERROR fetching ' + request.path);
        request.setTodo();
        this.state = StateProxy.FREE;
        this.incFails();
      });
  }

  incFails() {
    this.fails++;
    if (this.fails > config.MAX_ALLOWED_FAILS) {
      this.state = StateProxy.DEAD;
    }
  }

  isAvailable() {
    return this.state === StateProxy.FREE;
  }
}

Proxy.State = StateProxy;

export default Proxy;
