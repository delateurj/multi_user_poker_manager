const { forEach } = require("p-iteration");

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

const getHHList = require("./mavensAPI").getHHList;
const getHH = require("./mavensAPI").getHH;

function findHandSections(hand) {
  let handIndex = hand.findIndex((el) => el.includes("Hand #"));
  let gameIndex = hand.findIndex((el) => el.includes("Game: "));
  let tableIndex = hand.findIndex((el) => el.includes("Table: "));
  let buttonDeclarationIndex = hand.findIndex((el) =>
    el.includes("has the dealer button")
  );
  let playersStartIndex = tableIndex + 1;
  let playersEndIndex = buttonDeclarationIndex - 1;

  let summaryIndex = hand.findIndex((el) => el.includes("** Summary **"));

  let preflopStartIndex = buttonDeclarationIndex + 1;
  let preflopEndIndex = hand.findIndex((el) => el.includes("** Flop **"));
  if (preflopEndIndex < 0) {
    preflopEndIndex = summaryIndex - 1;
  }

  let flopStartIndex = hand.findIndex((el) => el.includes("** Flop **"));
  let flopEndIndex = hand.findIndex((el) => el.includes("** Turn **"));
  if (flopEndIndex < 0) {
    flopEndIndex = summaryIndex - 1;
  }

  let turnStartIndex = hand.findIndex((el) => el.includes("** Turn **"));
  let turnEndIndex = hand.findIndex((el) => el.includes("** River **"));
  if (turnEndIndex < 0) {
    turnEndIndex = summaryIndex - 1;
  }

  let riverStartIndex = hand.findIndex((el) => el.includes("** River **"));
  let riverEndIndex = summaryIndex - 1;

  let boardIndex = hand.findIndex((el) => el.includes("Board: ["));
  let flopCardsIndex = hand.findIndex((el) => el.includes("** Flop **"));
  let turnCardIndex = hand.findIndex((el) => el.includes("** Turn **"));
  let riverCardIndex = hand.findIndex((el) => el.includes("** River **"));

  let resultsSection = hand.map(
    (el) => el.includes("wins Pot") || el.includes("splits Pot")
  );

  let summaryResultsSectionStart = summaryIndex + 2;
  let summaryResultsSectionEnd = hand.indexOf("\n", summaryResultsSectionStart);

  return {
    handIndex,
    gameIndex,
    tableIndex,
    playersStartIndex,
    playersEndIndex,
    buttonDeclarationIndex,
    preflopStartIndex,
    preflopEndIndex,
    flopStartIndex,
    flopEndIndex,
    turnStartIndex,
    turnEndIndex,
    riverStartIndex,
    riverEndIndex,
    summaryIndex,
    boardIndex,
    flopCardsIndex,
    turnCardIndex,
    riverCardIndex,
    resultsSection,
    summaryResultsSectionStart,
    summaryResultsSectionEnd,
  };
}

function logSections(handLines, sectionIndexes) {
  console.log(
    "hand",
    sectionIndexes.handIndex,
    handLines[sectionIndexes.handIndex]
  );
  console.log(
    "game",
    sectionIndexes.gameIndex,
    handLines[sectionIndexes.gameIndex]
  );
  console.log(
    "table",
    sectionIndexes.tableIndex,
    handLines[sectionIndexes.tableIndex]
  );
  console.log(
    "players",
    sectionIndexes.playersStartIndex,
    sectionIndexes.playersEndIndex,
    handLines.slice(
      sectionIndexes.playersStartIndex,
      sectionIndexes.playersEndIndex + 1
    )
  );
  console.log(
    "button",
    sectionIndexes.buttonDeclarationIndex,
    handLines[sectionIndexes.buttonDeclarationIndex]
  );
  console.log(
    "preflop",
    sectionIndexes.preflopStartIndex,
    sectionIndexes.preflopEndIndex,
    handLines.slice(
      sectionIndexes.preflopStartIndex,
      sectionIndexes.preflopEndIndex
    )
  );
  console.log(
    "flop",
    sectionIndexes.flopStartIndex,
    sectionIndexes.flopStartIndex,
    handLines.slice(sectionIndexes.flopStartIndex, sectionIndexes.flopEndIndex)
  );
  console.log(
    "turn",
    sectionIndexes.turnStartIndex,
    sectionIndexes.turnStartIndex,
    handLines.slice(sectionIndexes.turnStartIndex, sectionIndexes.turnEndIndex)
  );
  console.log(
    "river",
    sectionIndexes.riverStartIndex,
    sectionIndexes.riverEndIndex,
    handLines.slice(
      sectionIndexes.riverStartIndex,
      sectionIndexes.riverEndIndex
    )
  );
  console.log(
    "summary",
    sectionIndexes.summaryIndex,
    handLines.slice(sectionIndexes.summaryIndex)
  );
}

function processActionSection(hand, actionType, actionSection) {
  let actionsArray = [
    "calls",
    "raises to",
    "folds",
    "checks",
    "bets",
    "posts small blind",
    "posts big blind",
    "posts ante",
  ];
  actionSection.forEach((dataLine) => {
    actionsArray.forEach((actionString) => {
      if (dataLine.includes(actionString)) {
        let actionAmount = "0";
        if (
          actionString === "raises to" ||
          actionString === "bets" ||
          actionString === "calls" ||
          actionString === "posts small blind" ||
          actionString === "posts big blind" ||
          actionString === "posts ante"
        ) {
          let startIndexOfAmount =
            dataLine.indexOf(actionString) + actionString.length + 1;

          let endIndexOfAmount = dataLine.indexOf(" ", startIndexOfAmount + 1);
          if (endIndexOfAmount < 0) {
            endIndexOfAmount = dataLine.length;
          }
          actionAmount = dataLine.slice(startIndexOfAmount, endIndexOfAmount);

          let nameEndIndex = dataLine.indexOf(" ");
          let playerTakingAction = dataLine.slice(0, nameEndIndex);
          let thePlayer = hand.players.find(
            (el) => el.name === playerTakingAction
          );

          thePlayer[actionType].push({
            actionString,
            actionAmount,
          });
          //console.log(playerTakingAction, actionString, actionAmount);
        } else if (actionString === "checks" || actionString === "folds") {
          let nameEndIndex = dataLine.indexOf(" ");
          let playerTakingAction = dataLine.slice(0, nameEndIndex);
          let thePlayer = hand.players.find(
            (el) => el.name === playerTakingAction
          );

          thePlayer[actionType].push({
            actionString,
            actionAmount: 0,
          });
        }
      }
    });
  });
}
async function processHH(startDate = false, endDate = false) {
  try {
    let HHList = await getHHList();
    let output = "";
    let hands = [];
    let logDateList = HHList.Date;

    /*** Uncomment following line FOR TESTING JUST DO FIRST FILE */
    //logDateList = ["2020-10-22"];

    let dataLinesWithBlanks = [];
    let dataLines = [];
    for (const [index, logDate] of logDateList.entries()) {
      if (
        (startDate ? logDate >= startDate : true) &&
        (endDate ? logDate <= endDate : true)
      ) {
        console.log(
          "Getting:",
          startDate,
          endDate,
          logDate,
          HHList.Name[index]
        );
        let response = await getHH(logDate, HHList.Name[index]);

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
      console.log(handCount, handNumber);

      let handDateTimeStart = handInfoLine.indexOf(" - ") + 3;
      let handDateTime = handInfoLine.slice(handDateTimeStart);

      let gameInfo = handLines[sectionIndexes.gameIndex];

      let smallBlindStart = gameInfo.indexOf("Blinds ") + 7;
      let smallBlindEnd = gameInfo.indexOf("/", smallBlindStart);
      let smallBlind = gameInfo.slice(smallBlindStart, smallBlindEnd);

      let bigBlind = gameInfo.slice(smallBlindEnd + 1);
      console.log(handDateTime);

      let hand = {
        handNumber,
        handDateTime,
        gameInfo,
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
              player.valueChange = valueChange;
              let holeCardsStart = line.indexOf("[") + 1;
              let holeCardsEnd = line.indexOf("]") - 1;
              let holeCards = line
                .slice(holeCardsStart, holeCardsEnd + 1)
                .split(" ");
              player.holeCards = holeCards;
            }
            //console.log(player);
          });
        }
      });
      hands.push({ ...hand });

      thisHandStartLine = nextHandStartLine;
    }
    /* hands.reverse().forEach((theHand) => {
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
    }); */
  } catch (err) {
    console.log(err);
  }
}
exports.processHH = processHH;

processHH(argv.start, argv.end);
