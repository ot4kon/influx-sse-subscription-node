const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const Subscribers = require("./subscribers");
const app = express();

const sendEvent = (data, res) => {
  res.write("event: dbwrite\n");
  // data.split("\n").map(line => res.write(`data: ${line}\n`))
  res.write(`data: ${data}`);
  res.write("data: \n\n");
}

app.locals.subscribers = new Subscribers(...[
  "gta",
  "gtb"
]);

app
  .use(bodyParser.text({ type: "text/plain" }))
  .use(compression())
  .disable("x-powered-by");

app.get("/", (req, res) => {
  res.sendStatus(404);
});

app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

app.get("/stream", (req, res) => {
  res.send(Object.keys(req.app.locals.subscribers.subscribers));
});

app.get("/stream/:channel", async (req, res) => {
    const {channel} = req.params;

    if (!req.app.locals.subscribers.has(channel)) {
      res.sendStatus(404);
    }

    if (req.headers.accept !== "text/event-stream") {
      res.sendStatus(400);
    }

    req.app.locals.subscribers.subscribe(channel, res);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    req.on("close", () => {
      console.log("caught close");
      req.app.locals.subscribers.unsubscribe(channel, res);
    });
  }
);

app.post("/write",
  async (req, res, next) => {
    if (req.headers["content-type"] !== "text/plain") {
      res.status(400);
      res.send("Content has to be plain text");
    } else {
      res.sendStatus(200);
      next();
    }
  },
  async (req, res) => {
    // or is it possible to have a set of async functions that will
    // send updates?
    const {db} = req.query;
    const data = req.body;

    req.app.locals.subscribers.notify(db, data, sendEvent)
  }
);

// app.get("/subscribers", async (req, res, nexy) => {
//   const subs = {};

//   for (const [channel, subscribers] of Object.entries(req.app.locals.subscribers.subscribers)) {
//     subs[channel] = Array.from(subscribers);
//   } 

//   res.send(JSON.stringify(subs));
// });

app.on("mount", () => {
  console.log(" -- APP MOUNTED -- ")
});

module.exports = app;
