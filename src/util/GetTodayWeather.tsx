import axios from "axios";

interface ApiForm {
  category: string;
}

export default function GetTodayWeather(
  date: string,
  xy: {
    x: number;
    y: number;
  },
  setTodayWeather: (newTodayWeather: object) => void,
  
) {
  const getTodayWeather = async () => {
    await axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst
?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=200&pageNo=1&dataType=JSON
&base_date=${date}&base_time=0200&nx=${xy.x}&ny=${xy.y}
`
      )
      .then((res) => {
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
        setTodayWeather({
          highestTemp,
          lowestTemp,
          todayWind,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getTodayWeather;
}
