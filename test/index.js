const assert = require("node:assert");
const { it } = require("node:test");

const headerBlocker = require("../index");

it("should allow to block header", () => {
  const expected = true;
  const req = {
    headers: {
      accept: "*/*",
      "user-agent": "node",
      "accept-language": "en",
    },
  };
  const res = {};
  const next = () => {};
  headerBlocker()(req, res, next);

  const actual = "block" in req;

  assert.strictEqual(expected, actual);
});

it("should make header blocked after block", () => {
  const expected = true;
  const req = {
    headers: {
      accept: "*/*",
      "user-agent": "node",
      "accept-language": "en",
    },
  };
  const res = {};
  const next = () => {};

  headerBlocker()(req, res, next);
  req.block();
  const actual = req.blocked;

  assert.strictEqual(expected, actual);
});

it("should make similar header blocked after block and retry with another one", () => {
  const expected = true;
  const req1 = {
    headers: {
      accept: "*/*",
      "user-agent": "node",
      "accept-language": "en",
    },
  };
  const req2 = {
    headers: {
      "user-agent": "node",
      accept: "*/*",
      "accept-language": "en",
    },
  };
  const res = {};
  const next = () => {};

  headerBlocker()(req1, res, next);
  req1.block();
  headerBlocker()(req2, res, next);
  const actual = req2.blocked;

  assert.strictEqual(expected, actual);
});
