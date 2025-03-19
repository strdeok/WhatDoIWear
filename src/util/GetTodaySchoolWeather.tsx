import axios from "axios";

interface ApiForm {
  category: string;
}

export default async function GetTodaySchoolWeather(
  date: string,
) {
  try {
    const res = await axios.get(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${
        import.meta.env.VITE_PUBLIC_API_KEY
      }&numOfRows=200&pageNo=1&dataType=JSON&base_date=${date}&base_time=0200&nx=54&ny=123
`
    );

    const data = res.data.response.body.items.item;
    const highestTemp = `${
      data.find((item: ApiForm) => item.category == "TMX").fcstValue
    }`;

    const lowestTemp = `${
      data.find((item: ApiForm) => item.category == "TMN").fcstValue
    }`;

    const todayWind = `${
      data.find((item: ApiForm) => item.category == "WSD").fcstValue
    }`;
    return {
      highestTemp,
      lowestTemp,
      todayWind,
    };
  } catch (error) {
    return error;
  }
}
