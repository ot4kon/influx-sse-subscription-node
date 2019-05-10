const logger = require("./src/logger");
let { app, subscribers } = require("./src/app");
const { app: appConfig, https: httpsConfig, influx: influxConfig } = require("./config");
const port = appConfig.port || 24138;


// CONFIGURE STUFF

const configureApp = (app, appConfig) => {
  const { compression: useCompression, trustProxy } = appConfig;

  app.disable("x-powered-by");

  if (useCompression) {
    const compression = require("compression");

    app.use(compression());
  }

  if (trustProxy) {
    app.set("trust proxy", true);
  }

  return app;
};

const createHttpsServer = (app, httpsConfig) => {
  const https = require("https");
  const fs = require("fs");

  const { privateKey, certificate } = httpsConfig;
  const key = fs.readFileSync(privateKey, "utf-8");
  const cert = fs.readFileSync(certificate, "utf-8");

  return https.createServer({
    key,
    cert
  }, app);
};

const createHttpServer = app => {
  const http = require("http");

  return http.createServer(app);
};

const createServer = (app, httpsConfig) => {
  const { useHttps } = httpsConfig;

  if (useHttps) {
    return createHttpsServer(app, httpsConfig);
  }

  return createHttpServer(app);
};

const createSubscriptions = (app, subscribers, influxConfig) => {
  const { databases } = influxConfig;

  for (const db of databases) {
    subscribers.add(db);
  }

  return app;
};


app = configureApp(app, appConfig);
app = createSubscriptions(app, subscribers, influxConfig);


// CREATE SERVER

const server = createServer(app, httpsConfig);

server.on("error", error => {
  logger.error("Error while starting app");
  logger.error(error.message);
  process.exit(1);
});

server.listen(port, () => {
  logger.info(`Started app... Listening on port ${port}`);
});
