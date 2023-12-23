const express = require("express");
const csvtojson = require("csvtojson");
const fs = require("fs");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

const csvFileToParse = "indiaAgricultureCropProduction.csv"; // const csvFileToParse = "testData2.csv";

app.get("/api/data", getData);

app.listen(3000, () => {
  console.log(`Application listening to port: ${PORT}`);
});

//Helper Functions

//Function to parse csv file to JSON.
function getData(request, response) {
  csvtojson()
    .fromFile(csvFileToParse)
    .then((jsonArray) => {
      response.json(jsonArray);
      console.log("JSON ", jsonArray);
    })
    .catch((err) => {
      console.log("Error :", err);
      response.status(500).json({ error: "Internal Server Error" });
    });
}
