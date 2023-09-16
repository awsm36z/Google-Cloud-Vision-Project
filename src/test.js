import Tesseract from "tesseract.js";
import fs from "fs";

async function extractTableFromImage(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(
    imagePath,
    "eng", // English language
    { logger: (info) => console.log(info) }
  );

  // Split the text into rows using line breaks
  const rows = text.split("\n");

  // Split each row into columns using a delimiter (e.g., comma or tab)
  const delimiter = "\t"; // You can change this based on the actual delimiter
  const tableData = rows.map((row) => row.split(delimiter));

  return tableData;
}

const imagePath = "./IMG_3021.jpg";

extractTableFromImage(imagePath)
  .then((tableData) => {
    // Convert the structured data into a CSV string
    const csvContent = tableData.map((row) => row.join(",")).join("\n");

    // Save the CSV content to a file
    fs.writeFileSync("output.csv", csvContent);
    console.log("CSV file created successfully");
  })
  .catch((error) => console.error(error));
