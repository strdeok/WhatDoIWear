import axios from "axios";
import { useStore } from "../zustand/state";

export default function GetMesureCenterXY() {
  const { address, setTmXY }: any = useStore();

  const getMesureCenterXY = () => {
    axios
      .get(
        `https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getTMStdrCrdnt?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&returnType=JSON&numOfRows=100&pageNo=1&umdName=${address.depth_3}`
      )
      .then((res) => {
        setTmXY(res.data.response.body.items[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getMesureCenterXY;
}
