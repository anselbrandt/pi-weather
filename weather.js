// https://weather.gc.ca/rss/city/qc-147_e.xml

import meteoWeather from "./meteo-weather/index.js";
import sense from "./node_modules/sense-hat-led/index.js"

const X = [64, 64, 64]; // white
const O = [0, 0, 0]; // black
const B = [0, 0, 64]; // blue

// prettier-ignore
const num = [
  [X, X, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X,],
  [O, O, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X,],
  [X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, X, X, X, O, O, O, O, O, X, O, O, O, O, O, O, O, X, X, X,],
  [X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, X, X, X,],
  [X, O, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X,],
  [X, X, X, O, O, O, O, O, X, O, O, O, O, O, O, O, X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, X, X, X,],
  [X, X, X, O, O, O, O, O, X, O, O, O, O, O, O, O, X, X, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X,],
  [X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X, O, O, O, O, O, O, O, X,],
  [X, X, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X,],
  [X, X, X, O, O, O, O, O, X, O, X, O, O, O, O, O, X, X, X, O, O, O, O, O, O, O, X, O, O, O, O, O, X, X, X,],
];

// const city = "qc-147";
// const lang = "e";
// const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

async function getWeather() {
  const options = {
    lang: "en",
    city: "qc-147",
  };
  const response = await meteoWeather(options);
  const current = response.entries.filter(
    (entry) => entry.type === "Current Conditions"
  )[0];
  const temp = current.temperature.replace("°C", "");
  const rain = current.condition.toLowerCase().includes("rain") ? true : false;

  return {
    rain,
    temp: parseFloat(temp),
  };
}

async function main() {
  const grid = Array(64).fill(O);

  const firstChar = (input) =>
    grid.map((val, index) => (input[index] ? input[index] : O));

  const secondChar = (input) =>
    grid.map((val, index) =>
      index > 4 && input[index - 5] ? input[index - 5] : O
    );

  const negIcon = grid.map((val, index) =>
    index === 48 || index === 49 ? X : O
  );

  const rainIcon = grid.map((val, index) =>
    index === 54 || index === 55 || index === 62 || index === 63 ? B : O
  );

  const decIcon = grid.map((val, index) => (index === 44 ? X : O));

  const merge = (arr1, arr2) =>
    arr1.map((val, index) =>
      val !== O ? val : arr2[index] !== O ? arr2[index] : O
    );

  const getDisplay = (options) => {
    const isRain = options.rain;
    const isNeg = options.temp < 0;
    const tempStr = options.temp.toFixed(1).replace("-", "");
    const whole = tempStr.split(".");
    const isDec = tempStr.includes(".") && whole[0].length === 1;
    const firstDig = whole[0] > 1 ? whole[0][0] : whole[0];
    const secondDig = whole[0].length > 1 ? whole[0][1] : whole[1];
    return {
      isRain,
      isNeg,
      isDec,
      firstDig: parseInt(firstDig),
      secondDig: secondDig ? parseInt(secondDig) : 0,
    };
  };

  const getPixels = (options) => {
    const { isRain, isNeg, isDec, firstDig, secondDig } = options;
    const withNeg = isNeg ? negIcon : grid;
    const withRain = isRain ? rainIcon : grid;
    const withDec = isDec ? decIcon : grid;
    return merge(
      merge(
        merge(firstChar(num[firstDig]), secondChar(num[secondDig])),
        merge(withNeg, withRain)
      ),
      withDec
    );
  };

  const weather = await getWeather();
  const display = getDisplay(weather);
  const pixels = getPixels(display);
  sense.sync.setPixels(pixels);
}

main().catch((error) => console.error(error));
