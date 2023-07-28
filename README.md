# express-header-blocker

`A library that provides middleware to block requests based on the order of certain headers`

## Installation

```bash
npm install express-header-blocker
```

## Usage

Import the middleware

```js
const headerBlocker = require("express-header-blocker");
```

Apply the middleware to specific routes or globally to all routes

```js
// Apply globally to all routes
app.use(headerOrderBlockerMiddleware());

// Apply to specific routes
app.post('/secure-route', headerOrderBlockerMiddleware(), (req, res) => {
    ...
});
```

## Options

The middleware accepts an options object with the following properties:

- `isModelLearningEnabled`: A boolean value that determines whether the middleware should enable model learning. When enabled, the middleware will learn and block new header orders that are not explicitly defined in the `onlyAnalyzeHeaders` configuration but can be swapped to the memento. (Default: `false`)

- `onlyAnalyzeHeaders`: An array of header names (case-insensitive) that should be analyzed by the middleware. If provided, only the specified headers will be considered for header order analysis. (Default: `[]` - meaning all headers will be considered)

- `sensitivity`: An integer that sets the sensitivity level of the header order analysis. The sensitivity determines how tolerant the middleware should be towards different header orders. Higher values make the middleware more permissive. (Default: `2`)

Configure the middleware when applying it if needed

```js
const options = {
  isModelLearningEnabled: true,
  onlyAnalyzeHeaders: ["user-agent", "content-type"],
  sensitivity: 3,
};

app.use(headerOrderBlockerMiddleware(options));
```

## Blocking Header Orders

The middleware maintains a collection of blocked header orders. If a request's header order matches a blocked order or can be transformed into a blocked order within the specified sensitivity level, the request will be blocked.

To block a specific header order manually, you can use the `req.block()` method within the route handler:

```js
app.post("/block-custom-order", (req, res) => {
  req.block();

  res.send("request is blocked due to a custom order");
});
```

## Examples

1. Blocking Specific Header Order

```js
const options = {
  onlyAnalyzeHeaders: ["authorization", "user-agent"],
  sensitivity: 2,
};

app.use(headerOrderBlockerMiddleware(options));
```

The middleware will only analyze the 'Authorization' and 'User-Agent' headers for order anomalies and block requests that match a blocked order within a sensitivity of 2.

2. Enabling Model Learning

```js
const options = {
  isModelLearningEnabled: true,
  onlyAnalyzeHeaders: ["accept", "content-type"],
};

app.use(headerOrderBlockerMiddleware(options));
```

With model learning enabled, the middleware will start learning from blocked headers, and if it encounters a new header order that requires blocking, it will add it to the blocked headers collection.

## Full example

```js
const express = require("express");

const headerBlocker = require("express-header-blocker");

const PORT = 3000;

const app = express();

app.use(
  headerBlocker({
    isModelLearningEnabled: false,
    onlyAnalyzeHeaders: [
      "host",
      "accept",
      "user-agent",
      "accept-encoding",
      "accept-language",
    ],
  })
);

app.use("/", (req, res, next) => {
  if (req.blocked) {
    return res.send("blocked");
  }

  next();
});

app.get("/", (_, res) => {
  res.send(
    `<form method="post" action="/block"><button type="submit">Block me</button></form>`
  );
});

app.post("/block", (req, res) => {
  req.block();

  return res.send("you are now blocked");
});

app.listen(PORT);
```
