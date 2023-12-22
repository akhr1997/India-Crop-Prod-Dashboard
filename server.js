const express = require("express");
const app = express();

const users = [
  {
    id: 1,
    name: "Ash",
  },
  {
    id: 2,
    name: "Kum",
  },
  {
    id: 3,
    name: "Ash2",
  },
];

app.get("/users", (request, response) => {
  response.json(users);
});

app.listen(3000);
