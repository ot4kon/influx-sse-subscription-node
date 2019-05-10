module.exports = {
  app: {
    host: "localhost",
    port: 8000,
    logging: true,
    logFile: "logs/server.log",
    errorLogFile: "logs/errors.log",
    consoleLogs: true,
    compression: true,
    trustProxy: true, // should be true if you want to run app behind reverse proxy
  },
  https: {
    useHttps: false,
    privateKey: "env/key.pem",
    certificate: "env/cert.crt"
  },
  db: {
    /* configure redis database, that will store information about connections, otherwise connections will be stored in app memory;
    this should not pose a big problems in terms of connections, because EventSource can recconect by itself if the app crashes and
    then restarts, but in terms of management it may be harder;
    also if you want to clusterize your app, using some database is needed to share state of connectinons between instances
    */
    useDb: false,
    host: "",
    port: "",
  },
  influx: {
    /* 
    you can try to subscribe to influx on the run, but you need to specify root user and password (only admin user has privilege)
    to add and remove subscriptions
    if you decide to do so, remember to secure this file properly or move sensitive data to other file and read them (this is js
      so you can do that easily)
    */
    useInflux: false,
    useHttps: false,
    parseLineProtocolData: false,
    host: "localhost",
    port: "8086",
    user: "",
    password: "",
    allDatabases: false,
    // databases: []
    databases: [
      "GTA",
      "fantasy"
    ]
  }
};
