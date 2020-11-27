const axios = require("axios");
//const fetch = require("node-fetch");
const https = require("https");
const dayjs = require("dayjs");
const moment = require("moment");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function getTournamentList() {
  const data = {
    JSON: "Yes",
    Command: "TournamentsResults",
    password: "jands1@POK",
  };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });

    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getTournamentList = getTournamentList;

async function getTournament(date, name) {
  const data = {
    Date: date,
    Name: name,
    JSON: "Yes",
    Command: "TournamentsResults",
    password: "jands1@POK",
  };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });
    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getTournament = getTournament;

//getTournamentList();
//getTournament("2020-11-23", "Another $5 tourney");

async function getHHList() {
  const data = {
    JSON: "Yes",
    Command: "LogsHandHistory",
    password: "jands1@POK",
  };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });

    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getHHList = getHHList;

async function getHH(date, name) {
  const data = {
    Date: date,
    Name: name,
    JSON: "Yes",
    Command: "LogsHandHistory",
    password: "jands1@POK",
  };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });

    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getHH = getHH;

async function getEventLogListAxios() {
  const data = { JSON: "Yes", Command: "LogsEvent", password: "jands1@POK" };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });

    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getEventLogListAxios = getEventLogListAxios;

async function getEventLog(date) {
  const data = {
    Date: date,
    JSON: "Yes",
    Command: "LogsEvent",
    password: "jands1@POK",
  };
  try {
    let theResponse = await axios({
      method: "get",
      url: "https://www.1655poker.com/api",
      params: data,
      httpsAgent: httpsAgent,
    });

    return theResponse.data;
  } catch (e) {
    console.log("error", e.code);
  }
}
exports.getEventLog = getEventLog;

/* let logList = [];
getEventLogListAxios().then((result) => {
  console.log(result.Date[0]);
  getEventLog(result.Date[0]).then((aresult) =>
    console.log("the last result", aresult)
  );
}); */
