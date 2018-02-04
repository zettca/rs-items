import qs from 'querystring';
import config from './config';

const StateRequest = { TODO: 0, DOING: 1, DONE: 2 };

class Request {
  constructor(endpoint, params) {
    this.state = StateRequest.TODO;
    this.path = endpoint + qs.stringify(params);
    this.time = Date.now();
    this.data = null;
  }

  getState() {
    if (this.isTimedOut()) {
      this.state = StateRequest.TODO;
    }
    return this.state;
  }

  setData(data) {
    this.data = data;
    this.setDone();
  }

  setDoing() {
    this.time = Date.now();
    this.state = StateRequest.DOING;
  }

  setDone() {
    this.time = Date.now();
    this.state = StateRequest.DONE;
  }

  setTodo() {
    this.time = Date.now();
    this.state = StateRequest.TODO;
  }

  isTimedOut() {
    return (
      this.state === StateRequest.DOING &&
      Date.now() - this.time > config.TIMEOUT);
  }
}

Request.State = StateRequest;

export default Request;
