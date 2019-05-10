const isSet = instance => {
  return instance instanceof Set;
};

// TODO: exceptions should be thrown, at least when subscribing

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
    if (!isSet(this.subscribers[name])) {
      this.subscribers[name] = new Set();
    }
  }

  get(name) {
    return this.subscribers[name];
  }

  has(name) {
    return this.subscribers.hasOwnProperty(name);
  }

  remove(name) {
    if (this.subscribers[name]) {
      delete this.subscribers[name];
    }
  }

  subscribe(name, req) {
    if (isSet(this.subscribers[name])) {
      this.subscribers[name].add(req);
    }
  }

  unsubscribe(name, req) {
    if (isSet(this.subscribers[name])) {
      this.subscribers[name].delete(req);
    }
  }

  hasSubscriber(name, req) {
    if (isSet(this.subscribers[name])) {
      return this.subscribers[name].has(req);
    }

    return false;
  }
}

module.exports = Subscribers;
