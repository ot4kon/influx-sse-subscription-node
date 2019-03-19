class Subscribers {
  constructor(...channels) {
    this.subscribers = {};

    if (channels.length > 0) {
      for (const channel of channels) {
        this.add(channel);
      }
    }
  }

  add(name) {
    if (!this.subscribers[name]) {
      this.subscribers[name] = new Set();
    }
  }

  remove(name) {
    if (this.subscribers[name]) {
      delete this.subscribers[name];
    }
  }

  has(name) {
    return this.subscribers.hasOwnProperty(name);
  }

  subscribe(name, req) {
    this.subscribers[name].add(req);
  }

  unsubscribe(name, req) {
    this.subscribers[name].delete(req);
  }

  async notify(name, payload, callback) {
    this.subscribers[name].forEach(async res => {
      console.log("notify");
      callback(payload, res);
    });

    console.log("done");
  }
}

module.exports = Subscribers;
