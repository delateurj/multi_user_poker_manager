const getTournamentList = require("./mavensAPI").getTournamentList;
const getTournament = require("./mavensAPI").getTournament;
const fs = require("fs").promises;

async function processTournaments() {
  let tournaments = [];

  try {

    let dataLines = await fs.readFile("dataLines.txt", 'utf8');

    dataLines = dataLines.split("\n");

    let tournamentList = await getTournamentList();
    let output = "";
    let tournamentDateList = tournamentList.Date;

    /*** Uncomment following line FOR TESTING JUST DO FIRST FILE */
    /*   tournamentDateList = ["2020-10-10"];
    tournamentList.Name = ["$1 Tournament"];
 */
    /* let dataLinesWithBlanks = [];
    for (const [index, logDate] of tournamentDateList.entries()) {
      if (logDate > "2020-11-06") {
        console.log(logDate, tournamentList.Name[index]);
        let response = await getTournament(logDate, tournamentList.Name[index]);
        // console.log(" first line", response.Data[0]);
        //Note that tournaments and hands can span over files since a new
        //file is created each day (server time)
        //We'll handle that with brute force by just combining all the files
        //but may be an issue with large number of files.  In that case some more
        //logic will be needed
        dataLinesWithBlanks = dataLinesWithBlanks.concat(response.Data);
      }
    } */

    //Need to strip out all blank lines that resolve to undefined.
    //Otherwise functions like .includes will fail
    //dataLines = dataLinesWithBlanks.filter((el) => el !== undefined);

    /*  fs.writeFile("dataLines.txt", dataLines.join("\n"), (err) => {
       if (err) {
         console.log(err);
       }
     }); */

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
      });

      thisTournamentLine = nextTournamentLine;
    }

    let players = [];

    tournaments.forEach((tournament) => {
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

    fs.writeFile("resultsWithDetails.csv", csvFile, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
}
processTournaments();
