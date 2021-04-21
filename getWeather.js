// https://weather.gc.ca/rss/city/qc-147_e.xml

const fetch = require("node-fetch");
const xml2js = require("xml2js").parseStringPromise;

const city = "qc-147";
const lang = "e";
const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

async function main() {
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
  const temp = parseFloat(
    current.temperature.replace(/\s/g, "").replace("&deg;C", "")
  );

  const humidity = parseFloat(
    current.humidity.replace(/\s/g, "").replace("%", "")
  );
  console.log(snow,rain, temp, humidity);
}

main().catch((error) => console.error(error));

