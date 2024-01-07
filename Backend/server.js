import axios from "axios";
import Redis from "ioredis";
import csvtojson from "csvtojson";
import express from "express";
import fs, { promises as fsPromises } from "fs";
import cors from "cors";
import https from "https";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 3000;
const csvFileToParse = "indiaAgricultureCropProduction.csv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Express App
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

//Redis Configuration
const redisOptions = {
  host: "localhost",
  port: 6379,
};

const redisClient = new Redis(redisOptions);

//Create HTTPS Server
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "certificate", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "certificate", "cert.pem")),
  },
  app
);

//Function to parse CSV file
async function parseCSVFile(csvFileToParse) {
  try {
    const csvData = await fsPromises.readFile(csvFileToParse, {
      encoding: "utf-8",
    });
    const jsonArray = await csvtojson().fromString(csvData);
    return jsonArray;
  } catch (error) {
    console.error("Error parsing CSV to JSON:", error);
    throw error;
  }
}

app.get("/api/data/", (req, res) => {
  res.send(Object.values(allProducts));
});

sslServer.listen(PORT, () => {
  console.log(`Server is listening on secure port ${PORT}`);
});

const getProducts = async () => {
  let cachedProductData = await redisClient.get("csvfiledata");
  if (cachedProductData) {
    console.log("cache hit");

    return { ...JSON.parse(cachedProductData) };
  } else {
    try {
      const jsonArray = await parseCSVFile(csvFileToParse);
      redisClient.set("csvfiledata", JSON.stringify(jsonArray), "EX", 120);
      console.log("cache miss");
      return { ...jsonArray };
    } catch (error) {
      console.error("Unable to parse CSV file: ", error);
      throw error;
    }
  }
};

let allProducts = await getProducts();
