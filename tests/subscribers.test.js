
const Subscribers = require("../src/subscribers");

describe("Subscribers class", () => {
  let subscribers;

  beforeEach(() => {
    subscribers = new Subscribers();
  });

  test("it instantiates Subscribers object", () => {
    expect(subscribers).toBeInstanceOf(Subscribers);
  });

  describe("#add", () => {
    test("creates new Set in object under a key specified as argument", () => {
      const key = "test";
      subscribers.add(key);

      expect(subscribers.subscribers).toHaveProperty("test");
      expect(subscribers.subscribers["test"]).toBeInstanceOf(Set);
    });

    test("if there's a Set under a key specified as arugment already, it leaves original Set untouched", () => {
      const key = "test";
      subscribers.add(key);

      const set = subscribers.subscribers[key];
      subscribers.add(key);

      expect(subscribers.subscribers[key]).toBe(set);
    });

    test("if there's another type written under a key specified as argument, it overwrites it", () => {
      const key = "test";
      const fakeValue = Object.create(null);
      subscribers.subscribers[key] = fakeValue;

      subscribers.add(key);

      expect(subscribers.subscribers[key]).toBeInstanceOf(Set);
      expect(subscribers.subscribers[key]).not.toBe(fakeValue);
    });
  });

  describe("#get", () => {
    test("returns whatever is under key specified as argument", () => {
      const key = "test";
      subscribers.add(key);

      const set = subscribers.subscribers[key];

      expect(subscribers.subscribers[key]).toBeInstanceOf(Set);
      expect(subscribers.subscribers[key]).toBe(set);
    });
  });

  describe("#has", () => {
    test("returns Boolean value if subscriber object has property specified as argument", () => {
      const key = "test";
      const fakeKey = "asdf";
      subscribers.add(key);

      expect(subscribers.has(key)).toBe(true);
      expect(subscribers.has(fakeKey)).toBe(false);
    });
  });

  describe("#remove", () => {
    test("removes property specified as argument from subscribers object", () => {
      const key = "test";
      
      subscribers.add(key);
      expect(subscribers.subscribers).toHaveProperty(key);

      subscribers.remove(key);
      expect(subscribers.subscribers).not.toHaveProperty(key);
    });

    test("if there's no property specified as argument, it does nothing", () => {

    });
  });

  describe("#subscribe", () => {
    test("adds passed request object to Set registered under key passed as first argument", () => {
      
    });
  });

  describe("#unsubscribe", () => {
    test("deletes passed request object to Set registered under key passed as first argument", () => {
      
    });
  });

  describe("#hasSubscriber", () => {
    
  });
});
