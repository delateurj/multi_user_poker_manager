require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const connectRedis = require("connect-redis");
const jwt = require("jsonwebtoken");
const RedisStore = connectRedis(session);
const interceptor = require("express-interceptor");
const responseLogger = require("./logging/log").responseLogger;
const requestLogger = require("./logging/log").requestLogger;
const nocache = require("nocache");
const data = require("./routes/data");
const auth = require("./routes/Authentication/auth");
const log = require("./logging/log").log;
const ringbuffer = require("./logging/log").ringbuffer;
const fs = require("fs");
const yn = require("yn");
const promiseTimeout = require("./utilities/promiseTimeout");
const simulatedDelay = 0;

var app = express();

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || "3003");

app.set("port", port);

app.use(nocache());

app.set("view engine", "jade");

if (yn(process.env.REDIRECT_TO_HTTPS)) {
  app.use(function (req, res, next) {
    log.info("Redirecting to https");
    if (!req.secure && req.get("X-Forwarded-Proto") !== "https") {
      res.redirect("https://" + req.get("Host") + req.url);
    } else next();
  });
}

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

let startupInfo = "";

startupInfo = startupInfo.concat(
  "\nNode Version:",
  process.version,
  "\nRedirect http to https:",
  process.env.REDIRECT_TO_HTTPS,
  "\nEnvironment:",
  process.env.NODE_ENV,
  "\nPort:",
  port,
  "\nStatic:",
  path.join(__dirname, "../client/build"),
  "\nAllowing Signups:",
  process.env.ALLOWING_SIGNUPS
);

app.use(express.static(path.join(__dirname, "../client/build")));

app.use(requestLogger);

app.use(interceptor(responseLogger));

if (process.env.REDIS_HOST) {
  startupInfo = startupInfo.concat(
    "\nUsing redis at: ",
    process.env.REDIS_HOST
  );
  var redis = require("redis");
  var client = redis.createClient(6379, process.env.REDIS_HOST);

  client.on("connect", function () {
    log.info("Redis client connected\n");
  });

  client.on("error", function (err) {
    log.error("Something went wrong " + err);
  });

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.EXPRESS_SESSION_SECRET,
      store: new RedisStore({
        host: process.env.REDIS_HOST,
        port: 6379,
        prefix: "sess",
      }),
    })
  );
} else {
  startupInfo = startupInfo.concat("\nUsing local redis");
  var redis = require("redis");
  var client = redis.createClient(6379, "127.0.0.1");

  client.on("connect", function () {
    log.info("Redis client connected\n");
  });

  client.on("error", function (err) {
    log.error("Something went wrong " + err);
  });

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.EXPRESS_SESSION_SECRET,
      store: new RedisStore({
        client: client,
      }),
    })
  );
}

app.use(passport.initialize());

app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  let deserializedUser = await data.getUserDetails(user._id);
  if (deserializedUser) {
    deserializedUser.emailOrUsername = user.emailOrUsername;
  }
  log.info("DeserialedUser", deserializedUser);
  done(null, deserializedUser);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "emailOrUsername",
      passwordField: "password",
    },
    auth.checkUsernameAndPassword
  )
);
app.post("/auth/login", (req, res, next) => {
  console.log("*******Login");
  passport.authenticate(
    "local",
    /*
      This functin is passed as the parameter done to our check usernameandpassword function
      that is provided to passport when we established the local stragy.
      This parameter is optional and passport has its own done but if we want something
      more than just a 401, we''l control */
    (err, user, info) => auth.customDone(err, user, info, req, res, next)
  )(req, res, next);
});

app.use("/auth/checkIfLoggedIn", async function (req, res) {
  log.info("check if logged in", req.user);
  await promiseTimeout(simulatedDelay);
  if (req.isAuthenticated()) {
    res.json({
      isLoggedIn: true,
    });
  } else {
    res.json({ isLoggedIn: false, email: null, role: null });
  }
});

app.all("/auth/signUp", (req, res, next) => {
  log.info("Signup request", process.env.ALLOWING_SIGNUPS);
  if (yn(process.env.ALLOWING_SIGNUPS)) {
    console.log("Signing up");
    auth.handleSignUpRequest(req, res, next);
  } else {
    log.info("Reject signup request as they are not currently allowed");
    res.status(400).send({
      errorType: "No Signups",
      errorMessage: "Sorry, we are not taking new signups at this time",
    });
  }
});

app.all("/auth/logOut", auth.logOut);

app.all("/auth/resetPassword", auth.resetPassword);

app.all("/auth/requestPasswordReset", auth.requestPasswordReset);

app.all(
  "/auth/deleteAccount",
  (req, res, next) => {
    req.isAuthenticated() ? next() : res.sendStatus(401);
  },
  auth.handleDeleteAccountRequest
);

app.all(
  "/api",
  (req, res, next) => {
    req.isAuthenticated() &&
    //Protect against malicous user trying to access app they do not own
    (!req.body.app_id ||
      req.user.apps.some((app) => app._id === req.body.app_id))
      ? next()
      : res.sendStatus(401);
  },
  data.api
);

app.all(
  "/createNewApp",
  (req, res, next) => {
    req.isAuthenticated() ? next() : res.sendStatus(401);
  },
  data.createNewApp
);

app.all(
  "/logs",
  (req, res, next) => {
    req.isAuthenticated() && req.user.role === "admin"
      ? next()
      : res.sendStatus(401);
  },
  (req, res, next) => {
    console.log("Sending log");
    let content = null;
    try {
      res.json(ringbuffer.records);
    } catch (e) {
      console.log("get log error error:", e);
    }
  }
);

//All other /* send the client build back
app.get("/*", function (request, response) {
  response.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// catch 404 and forward to error handle
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  console.log("In error handler");
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send("Error");
});

log.info(startupInfo, "\n");

module.exports = app;
