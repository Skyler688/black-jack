function log({ message, color = "white", style = "" }) {
  textMods = "\nBACKEND -> ";

  switch (style) {
    case "bright":
      textMods += "\x1b[1m";
      break;

    case "dim":
      textMods += "\x1b[2m";
      break;

    case "under":
      textMods += "\x1b[4m";
      break;
  }

  switch (color) {
    case "white":
      textMods += "\x1b[37m";
      break;

    case "red":
      textMods += "\x1b[31m";
      break;

    case "green":
      textMods += "\x1b[32m";
      break;

    case "yellow":
      textMods += "\x1b[33m";
      break;

    case "blue":
      textMods += "\x1b[34m";
      break;

    case "magenta":
      textMods += "\x1b[35m";
      break;

    case "cyan":
      textMods += "\x1b[36m";
      break;

    case "gray":
      textMods += "\x1b[90m";
      break;
  }

  console.log(`${textMods}${message}\x1b[0m`);
}

function err(message) {
  log({ message: message, color: "red" });
}

module.exports = { log, err };
