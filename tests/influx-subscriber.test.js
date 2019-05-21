const nock = require("nock");
const { InfluxClient } = require("../src/influx-subscriber");

// TODO: perhaps I should also test subject of access-control-allow-origin
// TODO: test exceptions
// TODO: test private functions

describe("InfluxClient class", () => {
  const URI = "http://localhost:8086";
  let influxClient;

  beforeEach(() => {
    influxClient = new InfluxClient();
  });

  test("it instantiates InfluxClient object", () => {
    expect(influxClient).toBeInstanceOf(InfluxClient);
  });

  describe("#ping", () => {
    const expectedStatusCode = 201;

    beforeEach(() => {
      nock(URI)
        .defaultReplyHeaders({ "access-control-allow-origin": "*" })
        .get(/ping/)
        .reply(expectedStatusCode);
    });

    test("it sends a request just to know if service is alive and returns status", async () => {
      const status = await influxClient.ping();

      expect(status).toEqual(expectedStatusCode);
    });
  });

  describe("#getDatabases", () => {
    const expectedStatusCode = 200;
    const expectedData = ["lelel", "trololol"];

    beforeEach(() => {
      nock(URI)
        .defaultReplyHeaders({ "access-control-allow-origin": "*" })
        .get(/query.*q=show\+databases.*/i)
        .reply(expectedStatusCode, expectedData);
    });

    test("it sends a request to obtain list of databases", async () => {
      const data = await influxClient.getDatabases();

      expect(data).toEqual(expectedData);
    });
  });

  describe("#createSubscription", () => {
    const expectedStatusCode = 201;
    const expectedData = "Created";

    beforeEach(() => {
      nock(URI)
        .defaultReplyHeaders({ "access-control-allow-origin": "*" })
        .post(/query.*q=create\+subscription.*/i)
        .reply(expectedStatusCode, expectedData);
    });

    test("it sends a request to create subscription on database", async () => {
      const data = await influxClient.createSubscription({
        name: "test_subscription",
        destination: ["rotfl"]
      });

      expect(data).toEqual(expectedData);
    });
  });

  describe("#dropSubscription", () => {
    const expectedStatusCode = 200;
    const expectedData = "OK";

    beforeEach(() => {
      nock(URI)
        .defaultReplyHeaders({ "access-control-allow-origin": "*" })
        .post(/query.*q=drop\+subscription.*/i)
        .reply(expectedStatusCode, expectedData);
    });

    test("it sends a request to remove subscription on database", async () => {
      const data = await influxClient.dropSubscription({
        name: "test_subscription"
      });

      expect(data).toEqual(expectedData);
    });
  });
});
