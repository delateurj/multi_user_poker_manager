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
exports.findHandSections = findHandSections;
exports.processActionSection = processActionSection;
exports.logSections = logSections;
