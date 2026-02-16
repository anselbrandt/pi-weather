async function getWeather() {
  const response = await fetch(
    "https://weather.gc.ca/api/app/v3/en/Location/45.529,-73.562?type=city"
  );
  const data = await response.json();
  const observation = data[0].observation;
  const temp = parseFloat(observation.temperature.metricUnrounded);
  const condition = observation.condition.toLowerCase();
  const rain = condition.includes("rain");

  return {
    rain,
    temp,
  };
}

async function main() {
  const weather = await getWeather();
  console.log(weather);
}

main().catch((error) => console.error(error));
