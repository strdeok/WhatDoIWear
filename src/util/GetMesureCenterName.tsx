import axios from "axios";
import { useStore } from "../zustand/state";

export default function GetMesureCenterName() {
  const { tmXY }: any = useStore();
  const getMesureCenterName = () => {
    axios
      .get(
        `
        https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&returnType=JSON&tmX=${tmXY.tmX}&tmY=${tmXY.tmY}&ver=1.1`
      )
      .then((res) => {
        console.log(res.data.body);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getMesureCenterName;
}
