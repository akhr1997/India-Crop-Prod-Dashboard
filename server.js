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

const csvFilePath = "indiaAgricultureCropProduction.csv";
// const csvFilePath = "testData2.csv";

//Function to parse csv file to JSON.
app.get("/api/data", (request, response) => {
  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonArray) => {
      response.json(jsonArray);
      console.log("JSON ", jsonArray);
    })
    .catch((err) => {
      console.log("Error :", err);
      response.status(500).json({ error: "Internal Server Error" });
    });
});

app.listen(3000, () => {
  console.log(`Application listening at port: ${PORT}`);
});
