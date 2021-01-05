const getTournamentList = require("./mavensAPI").getTournamentList;
const getTournament = require("./mavensAPI").getTournament;
const fs = require("fs").promises;
const fsNotPromises = require("fs");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

async function readAndProcessTournaments(
  startDate = undefined,
  endDate = undefined,
  useLocal = false
) {
  let tournaments = [];

  try {
    if (
      useLocal &&
      fsNotPromises.existsSync(
        "./serverFilesCache/" +
          startDate +
          "_" +
          endDate +
          "_" +
          "tournamentDataLines.txt"
      )
    ) {
      console.log(
        "Using local file:",
        "./serverFilesCache/" +
          startDate +
          "_" +
          endDate +
          "_" +
          "tournamentDataLines.txt"
      );
      try {
        dataLines = await fs.readFile(
          "./serverFilesCache/" +
            startDate +
            "_" +
            endDate +
            "_" +
            "tournamentDataLines.txt",
          "utf8"
        );
        dataLines = dataLines.split("\n");
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Pulling data from PM server");
      let tournamentList = await getTournamentList();
      let output = "";
      let tournamentDateList = tournamentList.Date;
      let dataLinesWithBlanks = [];
      for (const [index, logDate] of tournamentDateList.entries()) {
        if (
          (startDate ? logDate >= startDate : true) &&
          (endDate ? logDate <= endDate : true)
        ) {
          console.log("Getting", logDate, tournamentList.Name[index]);
          let response = await getTournament(
            logDate,
            tournamentList.Name[index]
          );
          // console.log(" first line", response.Data[0]);
          //Note that tournaments and hands can span over files since a new
          //file is created each day (server time)
          //We'll handle that with brute force by just combining all the files
          //but may be an issue with large number of files.  In that case some more
          //logic will be needed
          dataLinesWithBlanks = dataLinesWithBlanks.concat(response.Data);
        }
      }

      //Need to strip out all blank lines that resolve to undefined.
      //Otherwise functions like .includes will fail
      dataLines = dataLinesWithBlanks.filter((el) => el !== undefined);

      fs.writeFile(
        "./serverFilesCache/" +
          startDate +
          "_" +
          endDate +
          "_" +
          "tournamentDataLines.txt",
        dataLines.join("\n"),
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }

    let nextTournamentLine = dataLines.findIndex((element) =>
      element.includes("Tournament=")
    );

    let thisTournamentLine = nextTournamentLine;

    while (thisTournamentLine > -1) {
      let nextTournamentStartSubIndex = dataLines
        .slice(thisTournamentLine + 1)
        .findIndex((element, index) => {
          return element.includes("Tournament=");
        });

      if (nextTournamentStartSubIndex > -1) {
        nextTournamentLine =
          nextTournamentStartSubIndex + thisTournamentLine + 1;
      } else {
        nextTournamentLine = -1;
      }

      let thisTournamentEndLine = nextTournamentLine - 1;
      if (thisTournamentEndLine < 0) {
        thisTournamentEndLine = dataLines.length;
      }

      let tournamentLines = dataLines.slice(
        thisTournamentLine,
        thisTournamentEndLine
      );
      let name = tournamentLines[0].slice(11);
      let number = tournamentLines[1].slice(7);
      let buyIn = tournamentLines[3].slice(6);
      let numberOfEntries = tournamentLines[7].slice(9);
      let numberRemoved = tournamentLines[10].slice(8);
      let numberOfLateEntries = tournamentLines[8].slice(5);
      let rebuyCost = tournamentLines[13].slice(10);
      let stopOnChop = tournamentLines[15].slice(11);
      let startDateTime = tournamentLines[16].slice(6);
      let playersSection = tournamentLines.slice(
        17,
        17 + parseInt(numberOfEntries)
      );

      let players = [];
      let tournamentCheckSum = 0;
      playersSection.forEach((line, index) => {
        let playerNameStart = line.indexOf("=") + 1;
        let playerNameEnd = line.indexOf(" (");
        let name = line.slice(playerNameStart, playerNameEnd);

        let playerWinningsStart = line.indexOf(" (") + 2;
        let playerWinningsEnd = line.indexOf(") ");
        let playerWinnings = line.slice(playerWinningsStart, playerWinningsEnd);

        let playerRebuysStart = line.indexOf(") Rebuys:") + 9;
        let playerRebuysEnd = line.indexOf(" KO", playerRebuysStart);
        let playerRebuys = line.slice(playerRebuysStart, playerRebuysEnd);

        let playerInvestment =
          parseFloat(playerRebuys) * parseFloat(rebuyCost) + parseFloat(buyIn);

        let net = parseFloat(playerWinnings) - playerInvestment;

        let playerPlace = numberOfEntries - index;

        let knockedOutByStart = line.lastIndexOf(":") + 1;
        let knockedOutBy = line.slice(knockedOutByStart);

        if (knockedOutBy === "[removed]") {
          console.log("Got a remove");
          playerInvest = 0;
          net = 0;
        }

        players.push({
          name,
          playerWinnings,
          playerRebuys,
          playerPlace,
          net,
          knockedOutBy,
        });
        tournamentCheckSum += net;
      });

      let endDateTime = tournamentLines[17 + parseInt(numberOfEntries)].slice(
        5
      );
      /*      console.log("\nName:", name);
      console.log("Number:", number);
      console.log("Start Date/Time:", startDateTime);
      console.log("End Date/Time:", endDateTime);
      console.log("Buy In:", buyIn);
      console.log("Rebuy Cost:", rebuyCost);
      console.log("No. of Entries:", numberOfEntries);
      console.log("No Removed:", numberRemoved);
      console.log("No. of Late Entries:", numberOfLateEntries);
      console.log("Stop on chop:", stopOnChop);
      console.log("Players:", players);
      console.log("Tourn Checksum:", tournamentCheckSum); */

      tournaments.push({
        name,
        number,
        startDateTime,
        endDateTime,
        buyIn,
        rebuyCost,
        numberOfEntries,
        numberRemoved,
        numberOfLateEntries,
        stopOnChop,
        players,
        tournamentCheckSum,
        rawText: tournamentLines,
      });

      thisTournamentLine = nextTournamentLine;
    }

    let players = [];
    let highRollers = [];

    tournaments.forEach((tournament) => {
      console.log(tournament.buyIn, tournament.buyIn > 5);
      if (parseInt(tournament.buyIn) > 5) {
        tournament.players.forEach((player) => {
          indexOfPlayer = highRollers.findIndex(
            (nextPlayer) => nextPlayer.name === player.name
          );
          if (indexOfPlayer === -1) {
            highRollers.push({
              name: player.name,
              tournaments: [],
              totalWinnings: 0,
              knockedOutBy: {},
              knockedOut: {},
              totalKnockOuts: 0,
            });
            indexOfPlayer = highRollers.length - 1;
          }
          currentPlayer = highRollers[indexOfPlayer];
          currentPlayer.tournaments.push(tournament);
          currentPlayer.totalWinnings += player.net;
          tournament.players.forEach((nextPlayer) => {
            if (nextPlayer.name === currentPlayer.name) {
              if (currentPlayer.name !== nextPlayer.knockedOutBy) {
                if (
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] ===
                  undefined
                ) {
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] = 1;
                } else {
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] += 1;
                }
              }
            } else if (nextPlayer.knockedOutBy === currentPlayer.name) {
              if (currentPlayer.knockedOut[nextPlayer.name] === undefined) {
                currentPlayer.knockedOut[nextPlayer.name] = 1;
              } else {
                currentPlayer.knockedOut[nextPlayer.name] += 1;
              }
              currentPlayer.totalKnockOuts += 1;
            }
          });
        });
      } else {
        tournament.players.forEach((player) => {
          indexOfPlayer = players.findIndex(
            (nextPlayer) => nextPlayer.name === player.name
          );
          if (indexOfPlayer === -1) {
            players.push({
              name: player.name,
              tournaments: [],
              totalWinnings: 0,
              knockedOutBy: {},
              knockedOut: {},
              totalKnockOuts: 0,
            });
            indexOfPlayer = players.length - 1;
          }
          currentPlayer = players[indexOfPlayer];
          currentPlayer.tournaments.push(tournament);
          currentPlayer.totalWinnings += player.net;
          tournament.players.forEach((nextPlayer) => {
            if (nextPlayer.name === currentPlayer.name) {
              if (currentPlayer.name !== nextPlayer.knockedOutBy) {
                if (
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] ===
                  undefined
                ) {
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] = 1;
                } else {
                  currentPlayer.knockedOutBy[nextPlayer.knockedOutBy] += 1;
                }
              }
            } else if (nextPlayer.knockedOutBy === currentPlayer.name) {
              if (currentPlayer.knockedOut[nextPlayer.name] === undefined) {
                currentPlayer.knockedOut[nextPlayer.name] = 1;
              } else {
                currentPlayer.knockedOut[nextPlayer.name] += 1;
              }
              currentPlayer.totalKnockOuts += 1;
            }
          });
        });
      }
    });

    players.forEach((playerBeingUpdated) => {
      playerBeingUpdated.winningsByOpponent = {};

      players.forEach((opponent) => {
        if (opponent.name !== playerBeingUpdated.name) {
          let winnings = 0;
          let numberOfTournamentsWithThisOpponent = 0;
          let tournamentsWithOpponent = playerBeingUpdated.tournaments.filter(
            (tournamentOfPBU) =>
              tournamentOfPBU.players.find((el) => el.name === opponent.name)
          );
          tournamentsWithOpponent.forEach((tournament) => {
            let myPlayer = tournament.players.find(
              (tournPlayer) => tournPlayer.name === playerBeingUpdated.name
            );
            /* if (myPlayer.net > 0) {
              console.log(
                "pbu",
                playerBeingUpdated.name,
                "My player",
                myPlayer.name,
                myPlayer,
                opponent.name
              );
            } */
            winnings += myPlayer.net;
            numberOfTournamentsWithThisOpponent++;
          });
          playerBeingUpdated.winningsByOpponent[opponent.name] =
            Math.round((100 * winnings) / numberOfTournamentsWithThisOpponent) /
            100;
        }
      });
    });

    let checkSum = 0;
    players.forEach((player) => {
      checkSum = checkSum + player.totalWinnings;
      console.log("\n");
      console.log(player.name);
      console.log("Net winnings:", player.totalWinnings);
      console.log("Total Tournaments:", player.tournaments.length);
      let sortedWBO = Object.entries(player.winningsByOpponent);
      sortedWBO.sort(([, a], [, b]) => a - b);
      console.log(
        "Net winnings in tournies that include this player:",
        sortedWBO
      );
      console.log(
        "Winnings/Tournament:",
        (player.totalWinnings / player.tournaments.length).toFixed(2)
      );
      console.log("Knockouts", player.knockedOut);
      console.log("Total knockouts:", player.totalKnockOuts);
      console.log("KnockedOutBy", player.knockedOutBy);
    });

    let csvFile =
      "Name,Net,# Tourns,Net/Tourn,Your Huckleberry,Favorite Target\n";

    players.sort((a, b) => b.totalWinnings - a.totalWinnings);

    players.forEach((nextPlayer) => {
      console.log(nextPlayer.name, nextPlayer.tournaments.length);
      winningsPerTourn = (
        nextPlayer.totalWinnings / nextPlayer.tournaments.length
      ).toFixed(2);
      let sortedKnockedOutBy = Object.entries(nextPlayer.knockedOutBy).sort(
        (a, b) => b[1] - a[1]
      );
      console.log(sortedKnockedOutBy);
      let sortedKnockedOut = Object.entries(nextPlayer.knockedOut).sort(
        (a, b) => b[1] - a[1]
      );
      if (sortedKnockedOut[0] === undefined) {
        sortedKnockedOut = [["No one", 0]];
      }
      if (sortedKnockedOutBy[0] === undefined) {
        sortedKnockedOutBy = [["No one", 0]];
      }
      csvFile +=
        nextPlayer.name +
        "," +
        nextPlayer.totalWinnings +
        "," +
        nextPlayer.tournaments.length +
        "," +
        winningsPerTourn +
        "," +
        sortedKnockedOutBy[0][0] +
        "," +
        sortedKnockedOut[0][0];
      csvFile += "\n";
    });

    csvFile += "\n";
    csvFile += "High Rollers Standings\n";

    console.log("High Rollers", highRollers);
    highRollers.sort((a, b) => b.totalWinnings - a.totalWinnings);

    highRollers.forEach((nextPlayer) => {
      console.log(nextPlayer.name, nextPlayer.tournaments.length);
      winningsPerTourn = (
        nextPlayer.totalWinnings / nextPlayer.tournaments.length
      ).toFixed(2);
      let sortedKnockedOutBy = Object.entries(nextPlayer.knockedOutBy).sort(
        (a, b) => b[1] - a[1]
      );
      console.log(sortedKnockedOutBy);
      let sortedKnockedOut = Object.entries(nextPlayer.knockedOut).sort(
        (a, b) => b[1] - a[1]
      );
      if (sortedKnockedOut[0] === undefined) {
        sortedKnockedOut = [["No one", 0]];
      }
      if (sortedKnockedOutBy[0] === undefined) {
        sortedKnockedOutBy = [["No one", 0]];
      }
      csvFile +=
        nextPlayer.name +
        "," +
        nextPlayer.totalWinnings +
        "," +
        nextPlayer.tournaments.length +
        "," +
        winningsPerTourn +
        "," +
        sortedKnockedOutBy[0][0] +
        "," +
        sortedKnockedOut[0][0];
      csvFile += "\n";
    });

    fs.writeFile("./fileOutputs/resultsWithDetails.csv", csvFile, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
}
readAndProcessTournaments(argv.start, argv.end, argv.useLocal);
