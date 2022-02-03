// https://weather.gc.ca/rss/city/qc-147_e.xml
// https://weather.gc.ca/city/pages/qc-147_metric_e.html

const fetch = require("node-fetch");
const xml2js = require("xml2js").parseStringPromise;

const city = "qc-147";
const lang = "e";
const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

async function getWeather() {
  const response = await fetch(url);
  const text = await response.text();
  const data = await xml2js(text);
  const raw = data.feed.entry[1].summary[0]._;
  const observed = raw
    .replace(/<b>/g, "")
    .replace(/<?\/?b>/g, "")
    .replace(/<br?\/?>/g, "")
    .split(/\n/);
  const current = observed.reduce((acc, curr) => {
    const [key, value] = curr.split(":");
    return Object.assign(acc, {
      [key.replace(/\s/g, "").replace(/\/?/g, "").toLowerCase()]: value,
    });
  });
  const rain = current.condition.toLowerCase().split(" ").includes("rain")
    ? true
    : false;
  const snow = current.condition.toLowerCase().split(" ").includes("snow")
    ? true
    : false;
  const temp = current.temperature.replace(/\s/g, "").replace("&deg;C", "");
  const pressure = current.pressuretendency
    .split(" ")
    .map((val) => parseFloat(val))
    .filter((val) => !isNaN(val))[0]
    .toFixed(1);
  const isFalling = current.pressuretendency.split(" ").includes("falling");
  const isRising = current.pressuretendency.split(" ").includes("rising");
  const humidity = current.humidity.replace(/\s/g, "").replace("%", "");
  const windchill = (temp < 0) ? current.windchill.replace(/\s/g, "") : temp;
  const wind = current.wind
    .split(" ")
    .map((val) => parseInt(val))
    .filter((val) => !isNaN(val))[0]
    .toString();
  return {
    snow,
    rain,
    temp,
    pressure,
    isFalling,
    isRising,
    humidity,
    windchill,
    wind,
  };
}

async function main() {
  const weather = await getWeather();
  console.log(weather);
}

main().catch((error) => console.error(error));
