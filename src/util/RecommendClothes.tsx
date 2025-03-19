import axios from "axios";

export default async function RecommendClothes(todayWeather: {
  highestTemp: string;
  lowestTemp: string;
  todayWind: string;
}) {
  try {
    const res = await axios.get("/clothes.json");
    const data = res.data.data;
    for (var i = 0; i < data.length - 1; i++) {
      // 마지막 요소는 i + 1이 존재하지 않도록 -1까지 반복
      if (
        todayWeather.highestTemp <= data[i].temperature &&
        todayWeather.highestTemp > data[i + 1].temperature
      ) {
        return data[i].clothes;
      }
    }

    if (todayWeather.highestTemp > data[0].temperature) {
      return data[0].clothes;
    } else if (
      todayWeather.highestTemp < data[data.length - 1].temperature &&
      todayWeather.highestTemp.length > 1
    ) {
      return data[data.length - 1].clothes;
    }
  } catch (error) {
    return error
  }
}
