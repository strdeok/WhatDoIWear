import axios from "axios";

interface ApiForm {
  category: string;
}

export default function GetNowSchoolWeather(
  date: string,
  setNowWeather: (newNowWeather: object) => void,
  editedTime: () => string
) {
  const getNowSchoolWeather = () => {
    axios
      .get(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&numOfRows=10&pageNo=1&dataType=JSON&base_date=${date}&base_time=${editedTime()}&nx=54&ny=123`
      )
      .then((res) => {
        const data = res.data.response.body.items.item;
        const temperature = `${
          data.find((item: ApiForm) => item.category == "T1H").obsrValue
        }`;
        const humidity = `${
          data.find((item: ApiForm) => item.category == "REH").obsrValue
        }`;
        const wind = `${
          data.find((item: ApiForm) => item.category == "WSD").obsrValue
        }`;
        const nowWeather = {
          temperature,
          humidity,
          wind,
        };
        setNowWeather(nowWeather);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getNowSchoolWeather;
}
