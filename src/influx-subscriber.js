const request = require("request");

class InfluxSubscriber {
  constructor(opts) {
    this.proto = opts.proto || "http";
    this.host = opts.url || "localhost";
    this.port = opts.port || 8086;
    this.url = this.getUrl(this.proto, this.host, this.port);
    this.db = opts.db || "_default";
    this.username = opts.user || null;
    this.password = opts.password || null;
  }

  getUrl(proto, host, port) {
    return `${proto}://${host}:${port}/query`;
  }

  getDatabases() {
    // TODO
  }

  _getDestination(destinations) {
    return destinations.map(dst => `'${dst}'`).join(",");
  }

  _getSubscriptionQuery({name, db, rp="autogen", all=true, destination} = {}) {
    return `CREATE SUBSCRIPTION "${name}" ON "${db}"."${rp}" DESTINATIONS ${all ? "ALL" : "ANY"} ${this._getDestination(destination)}`;
  }

  createSubscription(opts) {
    const query = this._getSubscriptionQuery(opts);

    request.post({
      url: this.url,
      form: {
        db: this.db,
        q: query,
        u: this.username,
        p: this.password
      }
    }, (err, res, body) => {
      if (err) {
        return console.error("Cannot create subscription!");
      }

      console.log(`Subscription on ${opts.db}.${opts.rp} created\n`, body);
    });
  }

  dropSubscription(opts) {
    
  }
}

module.exports = InfluxSubscriber;
