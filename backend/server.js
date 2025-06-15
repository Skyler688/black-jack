const express = require("express");
const app = express();

const PORT = 4000;

const log = require("./helpers/consoleTool");

app.listen(PORT, () => {
  log({
    message: `Ready at http://localhost:${PORT}`,
    style: "bright",
    color: "green",
  });
});
