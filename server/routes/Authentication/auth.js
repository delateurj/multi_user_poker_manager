var bcrypt = require("bcryptjs");

const log = require("../../logging/log").log;

var axios = require("axios");

const querystring = require("querystring");

const sgMail = require("@sendgrid/mail");

const jwt = require("jsonwebtoken");

var connection = require("../../database/knex");
const knex = connection.knex;

const getUserDetails = require("../data").getUserDetails;

const simulatedDelay = 0;

const consoleFullObject = require("../../utilities/utilities")
  .consoleFullObject;

const deleteAccount = require("./deleteAccount").deleteAccount;

const promiseTimeout = require("../../utilities/promiseTimeout");

async function withings(req, res, next) {
  let response = null;
  let refreshResponse = null;
  let withings_jwt = null;
  let envBasedClientID =
    process.env.NODE_ENV === "production"
      ? process.env.WITHINGS_CLIENT_ID_PROD
      : process.env.WITHINGS_CLIENT_ID_DEV;
  let envBasedClientSecret =
    process.env.NODE_ENV === "production"
      ? process.env.WITHINGS_CLIENT_SECRET_PROD
      : process.env.WITHINGS_CLIENT_SECRET_DEV;
  try {
    withings_jwt = jwt.verify(req.query.state, process.env.WITHINGS_JWT_SECRET);
  } catch (e) {
    console.log("error verifying jwt:", e);
  }
  let data = {
    grant_type: "authorization_code",
    client_id: envBasedClientID,
    client_secret: envBasedClientSecret,
    code: req.query.code,
    redirect_uri: process.env.WITHINGS_CALLBACK,
  };
  console.log("Withings get token", data);
  try {
    response = await axios({
      method: "post",
      url: "https://account.withings.com/oauth2/token",
      data: querystring.stringify(data), //stringify turns it into application/x-www-form-urlencoded instead of json...seems it won't take json format even if specified as json in header
    });
  } catch (e) {
    console.log("withings step 2 error:", e.response ? e.response.data : e);
  }
  data = {
    grant_type: "refresh_token",
    client_id: envBasedClientID,
    client_secret: envBasedClientSecret,
    refresh_token: response.data.refresh_token,
  };
  try {
    refreshResponse = await axios({
      method: "post",
      url: "https://account.withings.com/oauth2/token",
      data: querystring.stringify(data),
    });
  } catch (e) {
    console.log("withings step 3 error:", e.response.data);
  }
  try {
    let expiry = new Date(Date.now() + 1000 * refreshResponse.data.expires_in);
    let update = {
      withings_user_id: response.data.user_id,
      withings_access_token: refreshResponse.data.access_token,
      withings_refresh_token: refreshResponse.data.refresh_token,
      withings_token_expiry: expiry,
    };
    let updateUserWithingsResult = await knex("user")
      .withSchema("meta")
      .where({ _id: withings_jwt._id })
      .update(update)
      .returning("email");
    res.redirect("http://jadsolutions.hopto.org");
  } catch (e) {
    console.log("Error in updating user withings data:", e);
  }
}
exports.withings = withings;

exports.createMETDefaultTable = createMETDefaultTable = async function (appID) {
  try {
    let insertManualEntryTableResult = await knex("datatable")
      .withSchema(appID)
      .insert({ name: "manual_entry" })
      .returning("*");

    let insertManualFieldsResult = await knex("datafield")
      .withSchema(appID)
      .insert([
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "calories",
          datatype: "numeric",
          orderonpage: 1,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "steps",
          datatype: "numeric",
          orderonpage: 2,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "waist",
          datatype: "numeric",
          orderonpage: 10,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "chest",
          datatype: "numeric",
          orderonpage: 11,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "fasting_hours",
          datatype: "numeric",
          orderonpage: 4,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "peak_hunger",
          datatype: "numeric",
          orderonpage: 5,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "stretch_sessions",
          datatype: "numeric",
          orderonpage: 6,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "took_hydro",
          datatype: "boolean",
          orderonpage: 7,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "diastolic",
          datatype: "numeric",
          orderonpage: 9,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "systolic",
          datatype: "numeric",
          orderonpage: 8,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "meditation",
          datatype: "numeric",
          orderonpage: 4,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "sleep_hours",
          datatype: "numeric",
          orderonpage: 3,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "note",
          datatype: "text",
          orderonpage: 12,
        },
        {
          datatable_id: insertManualEntryTableResult[0]._id,
          name: "entry_date",
          datatype: "timestamp default now()",
          orderonpage: 13,
        },
      ])
      .returning("*");
  } catch (e) {
    console.log("Error creating default manual fields");
    throw e;
  }
};

exports.createFocusDefaultTable = createFocusDefaultTable = async function (
  appID
) {
  try {
    let insertFocusTableResult = await knex("datatable")
      .withSchema(appID)
      .insert({ name: "focus" })
      .returning("*");

    let insertFocusFieldsResult = await knex("datafield")
      .withSchema(appID)
      .insert([
        {
          datatable_id: insertFocusTableResult[0]._id,
          name: "text",
          datatype: "text",
        },
        {
          datatable_id: insertFocusTableResult[0]._id,
          name: "title",
          datatype: "text",
        },
        {
          datatable_id: insertFocusTableResult[0]._id,
          name: "parent",
          datatype: "uuid",
        },
      ])
      .returning("*");
  } catch (e) {
    throw e;
  }
};

exports.signUp = signUp = async function (user) {
  await promiseTimeout(simulatedDelay);
  //ToDo:Put together all steps in transaction so if any one fails its rolled back
  //and user is not added.
  try {
    //ToDo: We are stomping on the original password of user reference
    //passed into the call by doing user.password =...this manifested itself
    //in testing when trying to figure why the test account users objects
    //passwords were changing...need to distinguish between plain and hashed password
    //properties instead of just one password property.
    let hashedPassword = await bcrypt.hash(user.password, 10);
    let insertUserResult = await knex("user")
      .withSchema("meta")
      .insert({
        email: user.email,
        username: user.username,
        password: hashedPassword,
      })
      .returning("_id");

    let createMETAppResult = await knex("app")
      .withSchema("meta")
      .insert({
        user_id: insertUserResult[0],
        name: "Easy Tracker",
        app_type: "built_in",
      })
      .returning("_id");

    await createMETDefaultTable(createMETAppResult[0]);

    let createFocusAppResult = await knex("app")
      .withSchema("meta")
      .insert({
        user_id: insertUserResult[0],
        name: "Focus",
        app_type: "built_in",
      })
      .returning("_id");

    await createFocusDefaultTable(createFocusAppResult[0]);
    return "Success for user:", user.username;
  } catch (e) {
    log.error("Error in signup...rethrowing:\n", e.message + "\n");
    throw e;
  }
};

exports.addFocusAppAndTable = addFocusAppAndTable = async function (user) {
  await promiseTimeout(simulatedDelay);
  //ToDo:Put together all steps in transaction so if any one fails its rolled back
  //and user is not added.
  //log.info("In signup function:", user);
  try {
    //ToDo: We are stomping on the original password of user reference
    //passed into the call by doing user.password =...this manifested itself
    //in testing when trying to figure why the test account users objects
    //passwords were changing...need to distinguish between plain and hashed password
    //properties instead of just one password property.

    let createFocusAppResult = await knex("app")
      .withSchema("meta")
      .insert({
        user_id: user._id,
        name: "Focus",
        app_type: "built_in",
      })
      .returning("_id");

    await createFocusDefaultTable(createFocusAppResult[0]);
    return "Success for user:", user.username;
  } catch (e) {
    log.error("Error in signup...rethrowing:\n", e.message + "\n");
    throw e;
  }
};

async function handleSignUpRequest(req, res, next) {
  await promiseTimeout(simulatedDelay);
  //ToDo:Put together all steps in transaction so if any one fails its rolled back
  //and user is not added.
  log.info("Passing on to signup", req.body.values);
  try {
    await signUp(req.body.values);
    res.json("Signup Success");
  } catch (e) {
    log.error(e.message, "Error in handling signup request");
    if (e.errorType === "Duplicate Key") {
      res.status(400).send({
        postgresError: e,
        errorType: "Duplicate Key",
        errorMessage: "Email Already Registered",
      });
    } else {
      log.error(e.message, "Error in handling signup request");
      res.status(400).send({
        postgresError: e,
        errorType: "Other",
        errorMessage: "Other",
      });
    }
  }
}
exports.handleSignUpRequest = handleSignUpRequest;

exports.handleDeleteAccountRequest = handleDeleteAccountRequest = async function (
  req,
  res,
  next
) {
  await promiseTimeout(simulatedDelay);
  //ToDo:Put together all steps in transaction so if any one fails its rolled back
  //and user is not added.
  try {
    await deleteAccount(req.user.email);
    res.status(200).json("Delete Success");
  } catch (e) {
    log.error(e.message, "Error in delete account request");
    res.status(400).send({
      postgresError: e,
      errorType: "Other",
      errorMessage: "Other",
    });
  }
};

function customDone(err, user, info, req, res, next) {
  if (err) {
    return res.status(500).send(info);
  } else if (user) {
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return (
        res
          .status(200)
          /*
          Can't use spread operator because Cypress does not support in plug ins
          because electron does not support yet and we call auth functions to do set up
          and tear down */
          .send(Object.assign({}, req.user, { apiResult: { error: "" } }))
      );
    });
  } else {
    return res.status(200).send(
      Object.assign({}, req.user, {
        apiResult: "failed_authentication",
        apiResultDetails: "Bad username/password combination",
      })
    );
  }
}
exports.customDone = customDone;

async function checkUsernameAndPassword(emailOrUsername, password, done) {
  await promiseTimeout(simulatedDelay);
  try {
    let result = null;
    result = await knex("meta.user")
      .leftJoin("meta.app", "user._id", "app.user_id")
      .select([
        "user.*",
        knex.raw(
          "ARRAY_AGG(json_build_object('id',app._id,'name',app.name)) as apps"
        ),
      ])
      .where({ email: emailOrUsername })
      .orWhere({ username: emailOrUsername })
      .groupBy("user._id");
    if (result.length < 1) {
      return done(null, false, {
        apiResult: {
          error: "user_error",
          errorReason: "No user with that email/username found",
          errorDetails: "",
        },
      });
    }
    let compareResult = await bcrypt.compare(password, result[0].password);

    if (compareResult) {
      let user = await getUserDetails(result[0]._id);
      user.emailOrUsername = emailOrUsername;
      return done(null, user, {
        apiResult: {
          error: "",
          errorReason: "",
          errorDetails: "",
        },
      });
    } else {
      return done(null, false, {
        apiResult: {
          error: "user_error",
          errorReason: "Incorrect Password",
          errorDetails: "",
        },
      });
    }
  } catch (e) {
    console.log("Errrrorrr");
    consoleFullObject(e);
    return done(e, null, null);
  }
}
exports.checkUsernameAndPassword = checkUsernameAndPassword;

async function requestPasswordReset(req, res, next) {
  await promiseTimeout(simulatedDelay);
  try {
    let token = require("crypto").randomBytes(32).toString("hex");

    result = await knex("user")
      .withSchema("meta")
      .returning("*")
      .where({ email: req.body.email })
      .update({
        reset_token: token,
        reset_token_expiry: new Date(Date.now() + 30 * 60 * 1000),
      });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: req.body.email,
      from: "joe.delateur@easyhealthtracker.com",
      subject: "Help logging in",
      text:
        "Please follow the link below to reset your password for EasyHealthTracker",
      html: "<p>http://localhost:3000/resetPassword/" + token + "</p>",
    };
    sgMail.send(msg).then(console.log("Success sending"));
  } catch (e) {
    console.log("******* error in Auth ***********");
    console.log(e.message);
    console.log("******************");
  }
}
exports.requestPasswordReset = requestPasswordReset;

async function resetPassword(req, res, next) {
  await promiseTimeout(simulatedDelay);

  try {
    let result = null;
    result = await knex("meta.user").where({ email: req.body.email });
    let tokensAreTheSame =
      JSON.stringify(result[0].reset_token) === req.body.token;
    let tokenNotExpired = new Date() < result[0].reset_token_expiry;
    if (tokensAreTheSame && tokenNotExpired) {
      let newPasswordHash = await bcrypt.hash(req.body.password, 10);
      let result = null;
      result = await knex("user")
        .withSchema("meta")
        .returning("*")
        .where({ email: req.body.email })
        .update({ password: newPasswordHash });
    }
  } catch (e) {
    console.log("******* error in Auth ***********");
    console.log(e.message);
    console.log("******************");
  }
}

exports.resetPassword = resetPassword;

async function logOut(req, res, next) {
  await promiseTimeout(simulatedDelay);
  try {
    req.logOut();
    console.log("Logging out");
    res.json("Logged Out");
  } catch (e) {
    console.log("******* error in user ***********");
    console.log(e.message);
    console.log("******************");
  }
}
exports.logOut = logOut;
