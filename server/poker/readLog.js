const fs = require("fs");
const { forEach } = require("p-iteration");

const getEventLogList = require("./mavensAPI").getEventLogListAxios;
const getEventLog = require("./mavensAPI").getEventLog;

async function processLogs() {
  try {
    let result = await getEventLogList();
    let output = "";
    let players = {};
    let logDateList = result.Date;
    await forEach(logDateList, async (logDate) => {
      if (logDate > "2020-11-06") {
        let response = await getEventLog(logDate);
        let dataLines = response.Data;
        await dataLines.forEach((data) => {
          let nextEndOfLine = 0;
          let lineStart = 0;
          while (nextEndOfLine !== -1) {
            let firstPipe = data.indexOf("|", lineStart);
            let eventDate = data.slice(lineStart, firstPipe);
            let secondPipe = data.indexOf("|", firstPipe + 1);
            let eventType = data.slice(firstPipe + 1, secondPipe);
            let startOfUserName = secondPipe + 1;
            if (eventType === "Account") {
              let userName = data.slice(
                startOfUserName,
                data.indexOf(" ", startOfUserName)
              );
              let endOfUserName = startOfUserName + userName.length;
              let accountChange = data.slice(
                endOfUserName + 1,
                data.indexOf(" ", endOfUserName + 1)
              );
              let changeReasonStart = data.indexOf("(", endOfUserName) + 1;
              let changeReasonEnd = data.indexOf(")", endOfUserName);
              let changeReason = data.slice(changeReasonStart, changeReasonEnd);

              if (accountChange !== "set" && changeReason !== "Remote") {
                if (players[userName] === undefined) {
                  console.log("adding", userName);
                  players[userName] = {
                    winnings:
                      parseFloat(accountChange) === NaN
                        ? 0
                        : parseFloat(accountChange),
                    details: [{ eventDate, accountChange, changeReason }],
                  };
                } else {
                  players[userName].details.push({
                    eventDate,
                    accountChange,
                    changeReason,
                  });
                  players[userName].winnings =
                    parseFloat(accountChange) === NaN
                      ? players[userName].winnings
                      : players[userName].winnings + parseFloat(accountChange);
                }
              }
            }

            nextEndOfLine = data.indexOf("\n", nextEndOfLine + 1);
            lineStart = nextEndOfLine + 1;
          }
        });
      }
    });
    let check = 0;
    console.log("players", players);
    Object.keys(players).forEach((player) => {
      console.log(player, players[player].winnings);
      output = output + player + "," + players[player].winnings + "\n";
    });
    Object.keys(players).forEach((player) => {
      players[player].details.forEach((detail) => {
        output = output + player + ",";
        output = output + detail.eventDate + ",";
        output = output + parseFloat(detail.accountChange) + ",";
        output = output + detail.changeReason + "\n";
      });
      console.log(player, players[player].winnings);
      console.log(players[player].details);
      if (players[player].winnings !== NaN) {
        check = check + players[player].winnings;
      }
    });
    console.log("Check:", check);
    fs.writeFile("results.csv", output, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

processLogs();
