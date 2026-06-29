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

async function getWeather() {
  const response = await fetch(
    "https://weather.gc.ca/api/app/v3/en/Location/45.529,-73.562?type=city"
  );
  const data = await response.json();
  const observation = data[0].observation;
  const temp = parseFloat(observation.temperature.metricUnrounded);
  const humidity = parseInt(observation.humidity);
  const condition = observation.condition.toLowerCase();
  const rain = condition.includes("rain");

  return {
    rain,
    temp,
    humidity,
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

  // "%" sign in the 3 free rows below the digits (rows 5-7), centered:
  //   . . # . . . # .   <- circle (col2) + slash top (col6)
  //   . . . . # . . .   <- slash middle (col4)
  //   . . # . . . # .   <- slash bottom (col2) + circle (col6)
  const percentIcon = grid.map((val, index) =>
    [42, 46, 52, 58, 62].includes(index) ? X : O
  );

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

  const getHumidityPixels = (humidity) => {
    const h = humidity > 99 ? 99 : humidity; // 8x8 fits at most two digits
    const digits =
      h >= 10
        ? merge(firstChar(num[Math.floor(h / 10)]), secondChar(num[h % 10]))
        : firstChar(num[h]);
    return merge(digits, percentIcon);
  };

  let latest = await getWeather();

  const showTemp = () => sense.sync.setPixels(getPixels(getDisplay(latest)));
  const showHumidity = () =>
    sense.sync.setPixels(getHumidityPixels(latest.humidity));

  // Refresh the weather data every 60 seconds.
  setInterval(async () => {
    try {
      latest = await getWeather();
    } catch (error) {
      console.error(error);
    }
  }, 60000);

  // Alternate the display: temperature for 7s, then humidity for 3s, repeating.
  const cycle = () => {
    showTemp();
    setTimeout(() => {
      showHumidity();
      setTimeout(cycle, 3000);
    }, 7000);
  };
  cycle();
}

main().catch((error) => console.error(error));
