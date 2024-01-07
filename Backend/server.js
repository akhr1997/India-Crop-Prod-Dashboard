import axios from "axios";
import Redis from "ioredis";
import csvtojson from "csvtojson";
import express from "express";
import { promises as fsPromises } from "fs";
import cors from "cors";

const csvFileToParse = "indiaAgricultureCropProduction.csv";
// const csvFileToParse = "testData2.csv";

const redisOptions = {
  host: "localhost",
  port: 6379,
};

const PORT = process.env.PORT || 3030;

const redisClient = new Redis(redisOptions);

async function parseCSVFile(csvFileToParse) {
  try {
    // Read CSV file
    const csvData = await fsPromises.readFile(csvFileToParse, {
      encoding: "utf-8",
    });

    // Convert CSV to JSON
    const jsonArray = await csvtojson().fromString(csvData);

    return jsonArray;
  } catch (error) {
    console.error("Error parsing CSV to JSON:", error);
    throw error;
  }
}

const getProducts = async () => {
  let cachedProductData = await redisClient.get("redis");
  if (cachedProductData) {
    console.log("cache hit");

    return { ...JSON.parse(cachedProductData) };
  } else {
    try {
      const jsonArray = await parseCSVFile(csvFileToParse);
      redisClient.set("redis", JSON.stringify(jsonArray), "EX", 120);
      console.log("cache miss");
      return { ...jsonArray };
    } catch (error) {
      console.error("Unable to parse CSV file: ", error);
      throw error;
    }
  }
};

const app = express();
const port = 3030;

app.use(
  cors({
    origin: "*",
  })
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Example usage:
// const beforeTime = new Date().getTime();
// const afterTime = new Date().getTime();
// allProducts.responseTime = `${afterTime - beforeTime}ms`;

let allProducts = await getProducts();

app.get("/", (req, res) => {
  res.send(Object.values(allProducts));
});

// console.log("All Productssssss: ", allProducts);
