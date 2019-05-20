const axios = require("axios");


// helper functions

const getApi = baseURL => {
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {}
  });
};

const getUrl = (proto, host, port) => {
  return `${proto}://${host}:${port}`;
};

const getDestinations = destinations => destinations.map(dst => `'${dst}'`).join(",");


// query literals

const QUERY_LITERALS = {
  GET_DATABASES: () => "SHOW DATABASES;",
  CREATE_SUBSCRIPTION: ({ name, db, rp, all, destination }) => `CREATE SUBSCRIPTION "${name}" ON "${db}"."${rp}" DESTINATIONS ${all ? "ALL" : "ANY"} ${getDestinations(destination)};`,
  DROP_SUBSCRIPTION: ({ name, db, rp }) => `DROP SUBSCRIPTION "${name}" ON "${db}"."${rp}";`
};


// exceptions

class InfluxSubscriberError extends Error {
  constructor(msg, err = null, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor.name);
    }

    this.message = msg;
    this.date = new Date();
    this.originalError = err;
  }
}

class ClientError extends InfluxSubscriberError {}

class ServerError extends InfluxSubscriberError {}

class RequestError extends InfluxSubscriberError {}


// influx client declaration

class InfluxClient {
  constructor(opts = {}) {
    this.proto = opts.proto || "http";
    this.host = opts.url || "localhost";
    this.port = opts.port || 8086;
    this.url = getUrl(this.proto, this.host, this.port);
    this.db = opts.db || "_default";
    this.username = opts.user || null;
    this.password = opts.password || null;
    this._api = getApi(this.url);
  }

  async ping({ verbose=false } = {}) {
    return await this.request({
      url: "/ping",
      method: "get",
      params: {
        verbose
      },
      query: "ping",
      returnProp: "status"
    });
  }

  async getDatabases({ db=this.db } = {}) {
    const query = QUERY_LITERALS.GET_DATABASES();
    const params = this.getParams({ db, q: query });

    return await this.request({
      method: "get",
      params,
      query
    });
  }

  async createSubscription({ name, db=this.db, rp="autogen", all=true, destination } = {}) {
    if (!name) {
      throw new ClientError("Argument 'name' is required");
    }

    if (!destination || !(destination instanceof Array)) {
      throw new ClientError("Argument 'destination' of type Array is required");
    }

    const query = QUERY_LITERALS.CREATE_SUBSCRIPTION({ name, db, rp, all, destination });
    const params = this.getParams({ db, q: query });

    return await this.request({
      method: "post",
      params,
      query
    });
  }

  async dropSubscription({ name, db=this.db, rp="autogen" } = {}) {
    if (!name) {
      throw new ClientError("Name argument is required");
    }

    const query =  QUERY_LITERALS.DROP_SUBSCRIPTION({ name, db, rp });
    const params = this.getParams({ db, q: query });

    return await this.request({
      method: "post",
      params,
      query
    });
  }

  async request({ url="/query", method, params, query, returnProp="data" }) {
    try {
      const response = await this._api({
        url,
        method,
        params
      });

      return response[returnProp];
    } catch (err) {
      this.handleError(err, query);
    }
  }

  handleError(error, query) {
    if (error.response && error.response.status > 500) {
      throw new ServerError(
        `Got ${error.response.status} sending ${query}`,
        error
      );
    }

    if (error.response && error.response.status > 400) {
      throw new ClientError(
        `Got ${error.response.status} sending ${query}`,
        error
      );
    }

    if (error.request) {
      throw new RequestError(
        `Could not send ${query}`,
        error
      );
    }

    throw new Error("Unexpected error", error);
  }

  getParams({ db=this.db, q, u=this.username, p=this.password } = {}) {
    return {
      db,
      q,
      u,
      p
    };
  }
}

module.exports = InfluxClient;
