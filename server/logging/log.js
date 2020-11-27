var bunyan = require("bunyan");
var bunyan = require("bunyan");

var ringbuffer = new bunyan.RingBuffer({ limit: 100 });
var log = bunyan.createLogger({
  name: "myapp",
  streams: [
    {
      stream: process.stdout,
      level: "info",
    },
    {
      path: "bunyanlog",
    },
    {
      level: "trace",
      type: "raw",
      stream: ringbuffer,
    },
  ],
});

var requestLogger = function (req, res, next) {
  try {
    res.append("reqURL", req.url);
    log.info(
      req.body,
      "Request: " + req.url + " " + JSON.stringify(req.body) + "\n"
    );
  } catch (e) {
    log.error(e, "req intercept error");
  }
  next();
};

var responseLogger = function (req, res) {
  return {
    isInterceptable: function () {
      //We don't want to intercept logs otherwise we'll log response which will have the logs
      //in the response body and next one will have logs of logs and so on....
      return req.url !== "/logs";
    },

    //Do nothing here, just send on body
    intercept: function (body, send) {
      send(body);
    },

    afterSend: function (oldBody, newBody) {
      try {
        let body = null;
        try {
          body = JSON.parse(oldBody);
        } catch (e) {
          body = "Could not parse body";
        }
        if (Array.isArray(body)) {
          body.forEach((obj) => (obj.exp = true));
        }
        log.info(
          {
            reqURL: req.url,
            body: body,
            eol: "\n",
          },
          "Response to: " + req.url + " " + oldBody.toString().slice(0, 100)
        );
      } catch (e) {
        log.error("Log Response Error", e);
      }
    },
  };
};

module.exports.responseLogger = responseLogger;
module.exports.requestLogger = requestLogger;
module.exports.log = log;
module.exports.ringbuffer = ringbuffer;
