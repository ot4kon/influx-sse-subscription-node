const express = require("express");
const logger = require("./logger");
const Subscribers = require("./subscribers");

const app = express();
const subscribers = new Subscribers();


// HELPER FUNCTIONS

const sendEvent = (res, data) => {
  res.write("event: dbwrite\n");
  res.write(`data: ${data}`);
  res.write("data: \n\n");
};

const getRemote = req => {
  return `${req.connection.remoteAddress}:${req.connection.remotePort}`;
};

const getLocal = req => {
  return `${req.connection.localAddress}:${req.connection.localPort}`;
};


// MIDDLEWARE

function parseRawBody (req, res, next) {
  req.body = "";

  req.on("data", dataChunk => {
    req.body += dataChunk;
  });

  req.on("end", () => {
    next();
  });
}

function connectionLogger (req, res, next) {
  const { originalUrl } = req;

  logger.info(`Connection from ${getRemote(req)} to ${getLocal(req)}${originalUrl}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);

  if (req.ips.length > 0) {
    logger.info(`Proxy connection. Trace: ${req.ips.join(",")}`);
  }

  next();
}


// ROUTES

app.use(connectionLogger);


app.get("/ping", function (req, res) {
  res.sendStatus(200);
});


app.get("/stream", function (req, res) {
  res.send(Object.keys(subscribers.subscribers));
});


app.get("/stream/:channel", function (req, res) {
  const { channel } = req.params;

  if (!subscribers.has(channel)) {
    return res.sendStatus(404);
  }

  if (req.headers.accept !== "text/event-stream") {
    return res.sendStatus(400);
  }

  try {
    const connection = { req, res };

    subscribers.subscribe(channel, connection);

    // don't send anything, because it will close the connection and we want it open
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    req.on("close", () => {
      logger.info(`Removing subscriber from ${channel}: ${getRemote(req)}`);

      subscribers.unsubscribe(channel, connection);
    });

    logger.info(`New subscriber to ${channel}: ${getRemote(req)}`);
  } catch (err) {
    logger.error(`Error when handling subscription to ${channel} for ${getRemote(req)}`);
    logger.error(err.message);

    res.sendStatus(500);
  }
});


app.post("/write", async function (req, res, next) {
  res.sendStatus(200);
  next();
},

parseRawBody,

async function (req) {
  const { db: channel } = req.query;
  const data = req.body;
  const connections = subscribers.get(channel);

  logger.info(`Update for ${channel}. Body content: ${data.length > 30 ? data.substring(0, 30) + "..." : data}`);

  connections.forEach(async connection => {
    try {
      const { req, res } = connection;

      logger.info(`Sending update to ${channel} subscriber: ${getRemote(req)}`);
      sendEvent(res, data);
    } catch (err) {
      logger.error(`Error while sending update to ${channel} subscriber: ${getRemote(req)}`);
      logger.error(err.message);
    }
  });
});


app.get("*", function (req, res) {
  res.sendStatus(404);
});


module.exports = {
  subscribers,
  app
};
