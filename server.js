const express = require("express");
const csvtojson = require("csvtojson");
const fs = require("fs");
const cors = require("cors");
const redis = require("redis");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

const client = redis.createClient({ legacyMode: true });
client.connect();
// client.on("connect", () => {
//   console.log("connected");
// });

const csvFileToParse = "indiaAgricultureCropProduction.csv";
// const csvFileToParse = "testData2.csv";

app.get("/api/data", getData);

app.get("/api/states", getStates);

app.listen(3000, () => {
  console.log(`Application listening to port: ${PORT}`);
});

//Helper Functions

async function getStates(request, response) {
  try {
    const jsonArray = await csvtojson().fromFile(csvFileToParse);
    const statesColumn = jsonArray.map((entry) => entry.State);
    response.json(statesColumn);
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
}

function getData(request, response) {
  const cacheKey = "data";

  client.get(cacheKey, (error, datas) => {
    if (error) {
      console.error(error);
    }

    if (datas != null) {
      console.log("Cache Hit!!!");
      return response.json(JSON.parse(datas));
    } else {
      console.log("Cache Miss!!");
      csvtojson()
        .fromFile(csvFileToParse)
        .then((jsonArray) => {
          response.json(jsonArray);
          client.SETEX(cacheKey, 3600, JSON.stringify(jsonArray));
        })
        .catch((err) => {
          console.log("Error :", err);
          response.status(500).json({ error: "Internal Server Error" });
        });
    }
  });
}
