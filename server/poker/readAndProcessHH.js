const fs = require("fs").promises;
const fsNotPromises = require("fs");
const { number } = require("yargs");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

const getHHList = require("./mavensAPI").getHHList;
const getHH = require("./mavensAPI").getHH;

const findHandSections = require("./hhUtilities").findHandSections;
const processActionSection = require("./hhUtilities").processActionSection;

async function readAndProcessHH(
  startDate = undefined,
  endDate = undefined,
  useLocal = false
) {
  let hands = [];
  try {
    let output = "";

    let dataLinesWithBlanks = [];
    let dataLines = [];

    if (
      useLocal &&
      fsNotPromises.existsSync(
        "./serverFilesCache/" +
          startDate +
          "_" +
          endDate +
          "_" +
          "hhDataLines.txt"
      )
    ) {
      console.log(
        "Using local file:",
        "./serverFilesCache/" +
          startDate +
          "_" +
          endDate +
          "_" +
          "hhDataLines.txt"
      );
      try {
        dataLines = await fs.readFile(
          "./serverFilesCache/" +
            startDate +
            "_" +
            endDate +
            "_" +
            "hhDataLines.txt",
          "utf8"
        );
        dataLines = dataLines.split("\n");
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Pulling data from PM server");
      let HHList = await getHHList();

      let logDateList = HHList.Date;

      for (const [index, logDate] of logDateList.entries()) {
        if (
          (startDate ? logDate >= startDate : true) &&
          (endDate ? logDate <= endDate : true)
        ) {
          console.log("Getting:", logDate, unescape(HHList.Name[index]));

          let response = await getHH(logDate, unescape(HHList.Name[index]));

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
          "hhDataLines.txt",
        dataLines.join("\n"),
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }

    let nextHandStartLine = dataLines.findIndex((element) =>
      element.includes("Hand #")
    );

    let thisHandStartLine = nextHandStartLine;
    let handCount = 0;
    while (thisHandStartLine > 0) {
      handCount++;
      let nextHandStartSubIndex = dataLines
        .slice(thisHandStartLine + 1)
        .findIndex((element, index) => {
          return element.includes("Hand #");
        });

      if (nextHandStartSubIndex > -1) {
        nextHandStartLine = nextHandStartSubIndex + thisHandStartLine + 1;
      } else {
        nextHandStartLine = -1;
      }

      let thisHandEndLine = nextHandStartLine - 1;
      if (thisHandEndLine < 0) {
        thisHandEndLine = dataLines.length;
      }

      let handLines = dataLines.slice(thisHandStartLine, thisHandEndLine);
      let sectionIndexes = findHandSections(handLines);

      let handInfoLine = handLines[sectionIndexes.handIndex];

      let handNumberStart = handInfoLine.indexOf("#") + 1;
      let handNumberEnd = handInfoLine.indexOf(" ", handNumberStart);
      let handNumber = handInfoLine.slice(handNumberStart, handNumberEnd);

      let handDateTimeStart = handInfoLine.indexOf(" - ") + 3;
      let handDateTime = handInfoLine.slice(handDateTimeStart);

      let gameInfo = handLines[sectionIndexes.gameIndex];

      let smallBlindStart = gameInfo.indexOf("Blinds ") + 7;
      let smallBlindEnd = gameInfo.indexOf("/", smallBlindStart);
      let smallBlind = parseInt(gameInfo.slice(smallBlindStart, smallBlindEnd));

      let bigBlindEnd = gameInfo.indexOf(" ", smallBlindEnd);
      let bigBlind = parseInt(gameInfo.slice(smallBlindEnd + 1, bigBlindEnd));

      let anteStart = gameInfo.indexOf("Ante", bigBlindEnd);
      let ante = anteStart > -1 ? parseInt(gameInfo.slice(anteStart + 5)) : 0;

      let hand = {
        handNumber,
        handDateTime,
        gameInfo,
        ante,
        smallBlind,
        bigBlind,
        players: [],
        rawText: handLines,
      };

      let playersSection = handLines.slice(
        sectionIndexes.playersStartIndex,
        sectionIndexes.playersEndIndex + 1
      );

      playersSection.forEach((dataLine) => {
        if (dataLine.substring(0, 4) === "Seat") {
          let indexOfColon = dataLine.indexOf(":");
          let indexOfLeftParen = dataLine.indexOf("(");
          let playerName = dataLine.substring(
            indexOfColon + 2,
            indexOfLeftParen - 1
          );
          let startingStack = dataLine.substring(
            indexOfLeftParen + 1,
            dataLine.length - 1
          );

          //Note/Todo even when sitting out, player is dealt cards
          //If they press ready button prior action coming to them
          //The can play the game.  So even a player we flag as sitting out
          //may have actions taken.
          let sittingOut = false;
          if (dataLine.includes(") - sitting out")) {
            sittingOut = true;
          }
          hand.players.push({
            name: playerName,
            startingStack,
            position: null,
            sittingOut,
            preFlopAction: [],
            flopAction: [],
            turnAction: [],
            riverAction: [],
            holeCards: [],
          });
        }
      });

      let dealerButtonLine = handLines[sectionIndexes.buttonDeclarationIndex];
      let indexOfEndOfName = dealerButtonLine.indexOf(" ");
      let playerOnTheButton = dealerButtonLine.substring(0, indexOfEndOfName);
      let indexOfPlayerOnTheButton = hand.players.findIndex(
        (el) => el.name === playerOnTheButton
      );
      hand.players[indexOfPlayerOnTheButton].position = 0;
      hand.players.forEach((player, index) => {
        hand.players[index].position =
          (hand.players.length + index - indexOfPlayerOnTheButton) %
          hand.players.length;
      });

      processActionSection(
        hand,
        "preFlopAction",
        handLines.slice(
          sectionIndexes.preflopStartIndex,
          sectionIndexes.preflopEndIndex
        )
      );

      processActionSection(
        hand,
        "flopAction",
        handLines.slice(
          sectionIndexes.flopStartIndex,
          sectionIndexes.flopEndIndex
        )
      );
      processActionSection(
        hand,
        "turnAction",
        handLines.slice(
          sectionIndexes.turnStartIndex,
          sectionIndexes.turnEndIndex
        )
      );

      processActionSection(
        hand,
        "riverAction",
        handLines.slice(
          sectionIndexes.riverStartIndex,
          sectionIndexes.riverEndIndex
        )
      );

      let letBoardCards = [];

      let boardLine = handLines[sectionIndexes.boardIndex];

      if (boardLine === undefined) {
        console.log("this one", handLines);
      }
      let boardCardsStart = boardLine.indexOf("[") + 1;
      let boardCardsEnd = boardLine.indexOf("]") - 1;

      let boardCardsText = boardLine.slice(boardCardsStart, boardCardsEnd + 1);

      let gameEndStart = boardLine.indexOf(", End: ") + 7;
      hand.boardCards = boardCardsText.split(" ");

      let gameEnd = boardLine.slice(gameEndStart);
      hand.gameEnd = gameEnd;

      let summaryResultsSection = handLines.slice(
        sectionIndexes.summaryResultsSectionStart,
        handLines.length
      );

      summaryResultsSection.forEach((line) => {
        if (line.slice(0, 5) === "Seat ") {
          let nameStart = line.indexOf(": ") + 2;
          let nameEnd = line.indexOf(" (", nameStart) - 1;
          let name = line.slice(nameStart, nameEnd + 1);
          hand.players.some((player) => {
            if (player.name === name) {
              let valueChangeStart = line.indexOf(" (") + 2;
              let valueChangeEnd = line.indexOf(") ") - 1;
              let valueChange = line.slice(
                valueChangeStart,
                valueChangeEnd + 1
              );
              player.valueChange = parseInt(valueChange);
              let holeCardsStart = line.indexOf("[") + 1;
              let holeCardsEnd = line.indexOf("]") - 1;
              let holeCards = line
                .slice(holeCardsStart, holeCardsEnd + 1)
                .split(" ");
              player.holeCards = holeCards;
            }
          });
        }
      });
      hands.push({ ...hand });

      thisHandStartLine = nextHandStartLine;
    }

    let numberOfFlops = 0;
    let numberOfPairedFlops = 0;
    hands.forEach((nextHand) => {
      let board = nextHand.boardCards;
      if (board.length > 2) {
        numberOfFlops++;
        let flop = board.slice(0, 3);
        let unsuitedFlop = flop.map((card) => card[0]);
        let unsuitedFlopSet = new Set(unsuitedFlop);
        if (1 === unsuitedFlopSet.size) {
          numberOfPairedFlops++;
        }
      }
    });
    if (false) {
      hands.reverse().forEach((theHand) => {
        console.log(theHand.handNumber);
        console.log(theHand.handDateTime);
        console.log(theHand.gameInfo);
        console.log(theHand.boardCards);
        console.log(theHand.gameEnd);
        console.log(
          "Small Blind:",
          theHand.smallBlind,
          "Big Blind:",
          theHand.bigBlind
        );
        theHand.players.forEach((player) => {
          console.log("Name:", player.name);
          console.log("Position:", player.position);
          console.log("Sitting Out:", player.sittingOut);
          console.log("PreFlop Actions:", player.preFlopAction);
          console.log("Flop Actions", player.flopAction);
          console.log("Turn Actions", player.turnAction);
          console.log("River Actions", player.riverAction);
          console.log("Summary value change", player.valueChange);
          console.log("Hole Cards", player.holeCards);
        });
        console.log(hands[0].rawText);
        console.log(hands[hands.length - 1]);
        console.log("Total # of hands:", hands.length);
      });
    }
  } catch (err) {
    console.log("second catch", err);
  }
  return hands;
}
exports.readAndProcessHH = readAndProcessHH;

function playersFromHands(hands) {
  let players = [];
  console.log("pFh", hands.length);

  hands.forEach((hand) => {
    hand.players.forEach((playerInHand) => {
      let playerIndex = -1;
      players.map((playerInPlayers, index) => {
        if (playerInPlayers.name === playerInHand.name) {
          playerIndex = index;
        }
      });

      let { name, ...thisHand } = playerInHand;
      thisHand.hand = hand;
      if (playerIndex === -1) {
        players.push({ name: playerInHand.name, hands: [thisHand] });
      } else {
        players[playerIndex].hands.push(thisHand);
      }
    });
  });

  return players;
}

function findPlayersBiggestLoss(player) {
  let biggestLossHand = undefined;
  player.hands.length > 0 ? (biggestLossHand = player.hands[0]) : 0;
  player.hands.forEach((playerHand) => {
    if (biggestLossHand.valueChange > playerHand.valueChange) {
      console.log(
        "Even worse",
        biggestLossHand.valueChange,
        playerHand.valueChange
      );
      biggestLossHand = playerHand;
    }
  });
  console.log("Worse hand", biggestLossHand);
}
function toggleLog() {
  if (arguments[0] === true) {
    console.log(Object.values(arguments).slice(1).join(""));
  }
}

async function test() {
  let hands = await readAndProcessHH(argv.start, argv.end, argv.useLocal);
  let players = playersFromHands(hands);
  findPlayersBiggestLoss(players[0]);
}

//8355
//8355 *
//Unit 314
//Arco's storage
//1357 San Mateo Ave.
//SSF

test();
