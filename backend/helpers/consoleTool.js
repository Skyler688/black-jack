function log({ message, color = "white", style = "", newLine = true }) {
  textMods = "BACKEND -> ";

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

    case "blink":
      textMods += "\x1b[5m";
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

  if (newLine) {
    console.log(`${textMods}${message}\x1b[0m`);
  } else {
    process.stdout.write(`${textMods}${message}\x1b[0m`);
  }
}

module.exports = log;
