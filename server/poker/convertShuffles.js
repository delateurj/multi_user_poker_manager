const fs = require("fs").promises;

async function covertShuffles() {
  try {
    let rank = [
      "",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
      "A",
    ];
    let suit = ["", "c", "d", "h", "s"];
    dataLines = await fs.readFile("shuffles.txt", "utf8");
    let decodedLines = "";
    dataLines = dataLines.split("\n");
    dataLines.forEach((dataLine) => {
      lineArray = dataLine.split(" ");
      let decodeLine = "";
      let splitLine = "";
      if (lineArray.length === 52) {
        lineArray.map((nextCard) => {
          splitLine = splitLine + nextCard[0] + "," + nextCard[1] + ",";
          decodeLine =
            decodeLine +
            rank.indexOf(nextCard[0]) +
            "," +
            suit.indexOf(nextCard[1]) +
            ",";
        });
        decodedLines += decodeLine + "\n";
        console.log(decodeLine.split(",").length);
      }
    });
    await fs.writeFile("decodedShuffles.csv", decodedLines);
  } catch (err) {
    console.log(err);
  }
}

covertShuffles();
