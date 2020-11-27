var express = require("express");
var router = express.Router();
const util = require("util");
var connection = require("../database/knex");
const knex = connection.knex;
const meta = require("../database/meta");
var log = require("../logging/log").log;
const axios = require("axios");
const querystring = require("querystring");

const simulatedDelay = 0;

const promiseTimeout = function (ms) {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
  return timeout;
};

async function createNewApp(req, res, next) {
  try {
    let result = await knex("app")
      .withSchema("meta")
      .insert({
        user_id: req.user._id,
        name: req.body.name,
        app_type: req.body.app_type,
      })
      .returning("*");
    console.log("new result", result);
    result = await knex("user")
      .withSchema("meta")
      .update({ defaultapp_id: result[0]._id });
    res.json(result);
  } catch (e) {
    log.error("Error in createNewApp", e);
    res.json(e.message);
  }
}
exports.createNewApp = createNewApp;

async function api(req, res, next) {
  switch (req.body.type) {
    case "KnexSelect":
      await promiseTimeout(simulatedDelay);
      try {
        let theQuery = knex(req.body.tableName)
          .withSchema(req.body.app_id)
          .where(req.body.where);
        if (req.body.orderBy) {
          theQuery = theQuery.orderByRaw(
            req.body.direction
              ? req.body.orderBy + " " + req.body.direction
              : req.body.orderBy
          );
        }
        let result = null;
        result = await theQuery;

        res.json(result);
      } catch (e) {
        console.log("******* error in dataAPI ***********");
        console.log(e.message);
        console.log("******************");
        res.json(e.message);
      }

      break;

    case "KnexInsert":
      log.info("Special", req.body);
      await promiseTimeout(simulatedDelay);
      try {
        let result = null;
        result = await knex(req.body.tableName)
          .withSchema(req.body.app_id)
          .returning("*")
          .insert(req.body.values);
        res.json(result);
      } catch (e) {
        res.json({ error: e });
        log.error(e, "******* error in dataAPI ***********");
      }

      break;

    case "KnexUpdate":
      await promiseTimeout(simulatedDelay);
      try {
        let result = null;
        result = await knex(req.body.tableName)
          .withSchema(req.body.app_id)
          .returning("*")
          .where(req.body.where)
          .update(req.body.values);
        res.json(result);
      } catch (e) {
        console.log("******* error in dataAPI ***********");
        console.log(e.message);
        console.log("******************");
      }

      break;

    case "KnexDelete":
      await promiseTimeout(simulatedDelay);
      try {
        let result = null;
        result = await knex(req.body.tableName)
          .withSchema(req.body.app_id)
          .where(req.body.where)
          .del();
        res.json(result);
      } catch (e) {
        console.log("******* error KnexDelete of dataAPI ***********");
        console.log(e.message);
        console.log("******************");
      }

      break;

    case "GetUserDetails":
      await promiseTimeout(simulatedDelay);
      try {
        let user = await getUserDetails(req.user._id);
        user.emailOrUsername = req.user.emailOrUsername;
        res.json(user);
      } catch (e) {
        log.error(e, "Error in  handle get user details");
      }
      break;

    case "DropAndCreateMetaTables":
      try {
        await promiseTimeout(simulatedDelay);
        console.log("Dropping and creaeting meta tables");
        let result = await meta.DropAndCreateMetaTables();
        res.json(result);
      } catch (e) {
        console.log("******* error of dataAPI ***********");
        console.log(e.message);
        console.log("******************");
      }
      break;

    case "GetDefaultDataTableIDForDefaultApp":
      try {
        let getDefaultAppidResult = await knex("user")
          .withSchema("meta")
          .select("defaultapp_id")
          .where({ _id: insertUserResult[0] });
      } catch (e) {
        console.log(e.message);
      }
      break;

    default:
      res.json([
        {
          message: "Unknown request type",
        },
      ]);
  }
}

async function getUserDetails(user_id) {
  try {
    let result = null;
    result = await knex("meta.user")
      .leftJoin("meta.app", "user._id", "app.user_id")
      .select([
        "user.*",
        knex.raw(
          "ARRAY_AGG(json_build_object('_id',app._id,'name',app.name,'app_type',app.app_type)) as apps"
        ),
      ])
      .where({ "user._id": user_id })
      .groupBy("user._id");
    if (result.length < 1) {
      console.log("No user ");
      return null;
    }
    let user = {};
    user._id = result[0]._id;
    user.defaultapp_id = result[0].defaultapp_id;
    user.app_id = result[0].defaultapp_id;
    user.role = result[0].role;
    user.username = result[0].username;
    user.email = result[0].email;
    user.apps = result[0].apps;
    for (let i = 0; i < user.apps.length; i++) {
      let tablesResult = null;
      tablesResult = await knex("datatable")
        .withSchema(user.apps[i]._id)
        .leftJoin("datafield", "datatable._id", "datafield.datatable_id")
        .select(
          "datatable.*",
          knex.raw(
            "ARRAY_REMOVE(ARRAY_AGG(to_jsonb(datafield.*)),NULL) as datafields"
          )
        )
        .groupBy("datatable._id");

      user.apps[i].tables = tablesResult;

      user.apps[i].pages = await getPageandSubPageDetails(user.apps[i]._id);
    }

    return user;
  } catch (e) {
    log.error(e, "Error in get user details");
  }
}
exports.getUserDetails = getUserDetails;

async function getPageandSubPageDetails(theSchema) {
  try {
    let result = null;
    result = await knex.raw(getPageDetailsSQLString(theSchema));
    for (let i = 0; i < result[1].rows.length; i++) {
      let nextPage = result[1].rows[i];
      if (nextPage.childpages) {
        for (let j = 0; j < nextPage.childpages.length; j++) {
          let nextChild = nextPage.childpages[j];
          nextChild = createSubPageDetails(nextChild, result[1].rows);
          result[1].rows[i].childpages[j] = nextChild;
        }
      }
    }
    return result[1].rows;
  } catch (e) {
    console.log("******* error of dataAPI ***********");
    console.log(e.message);
    console.log("******************");
  }
}

function createSubPageDetails(subpage, pages) {
  let thePageDetails = pages.find((x) => x._id === subpage._id);

  if (thePageDetails.childpages)
    for (let i = 0; i < thePageDetails.childpages; i++) {
      thePageDetails.childpages[i] = createSubPageDetails(
        thePageDetails.childpages[i],
        pages
      );
    }

  return thePageDetails;
}

function getPageDetailsSQLString(theSchema) {
  return (
    `
set search_path to "` +
    theSchema +
    `",public;
select 
  page.name,
  page._id,
  page.pagetype,
  datatable.name as datatablename,
  datatable_id,
  (select 
    array_agg(row_to_json(pagefields))  
   from
    (
    select 
      label,
      defaultvalue,
      valuelist_id,
      datafield._id,
      datafield.name,
      datafield.datatype
    from 
      pagefield, datafield
    where 
      pagefield.page_id = page._id
    and 
      pagefield.datafield_id = datafield._id
      order by 
      pagefield.page_id) 
    pagefields
    ) as pagefields,
    (select 
      array_agg(row_to_json(childpages))  
     from
      (
      select 
        p2.name,p2._id
      from 
        subpage, page p2
      where 
        subpage.subpage_id = p2._id
      and 
        subpage.page_id = page._id
      order by p2.name) 
      childpages
      ) as childpages
from 
  page
left join 
  datatable 
on 
  datatable._id = page.datatable_id 
`
  );
}

exports.api = api;
