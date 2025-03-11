import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useStore } from "../zustand/state";
import { WiDust } from "react-icons/wi";

interface TMXY {
  tmX: number;
  tmY: number;
}

interface MicroDust {
  presentTime: string;
  microDust: string;
  microDustGrade: string | undefined;
  dubleMicroDust: string;
  dubleMicroDustGrade: string | undefined;
}

export default function GetMicroDust() {
  const { address }: any = useStore();
  const [tmXY, setTmXY] = useState<TMXY>({
    tmX: 0,
    tmY: 0,
  });
  const [measureCenter, setMeasureCenter] = useState("");
  const [microDust, setMicroDust] = useState<MicroDust>({
    presentTime: "",
    microDust: "",
    microDustGrade: "",
    dubleMicroDust: "",
    dubleMicroDustGrade: "",
  });

  const measureDustGrade = (grade: string) => {
    switch (grade) {
      case "1":
        return "좋음";
      case "2":
        return "보통";
      case "3":
        return "나쁨";
      case "4":
        return "매우나쁨";
    }
  };

  const getMesureCenterXY = () => {
    axios
      .get(
        `https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getTMStdrCrdnt?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&returnType=JSON&numOfRows=100&pageNo=1&umdName=${address.depth_3}`
      )
      .then((res) => {
        const tmXY = {
          tmX: res.data.response.body.items[0].tmX,
          tmY: res.data.response.body.items[0].tmY,
        };
        setTmXY(tmXY);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getMesureCenterName = () => {
    axios
      .get(
        `
              https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList?serviceKey=${
                import.meta.env.VITE_PUBLIC_API_KEY
              }&returnType=JSON&tmX=${tmXY.tmX}&tmY=${tmXY.tmY}&ver=1.1`
      )
      .then((res) => {
        setMeasureCenter(res.data.response.body.items[0].stationName);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getMicroDust = () => {
    axios
      .get(
        `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${
          import.meta.env.VITE_PUBLIC_API_KEY
        }&returnType=JSON&stationName=${measureCenter}&dataTerm=DAILY&pageNo=1&numOfRow=100&ver=1.1`
      )
      .then((res) => {
        const recentResult = res.data.response.body.items[0];
        const presentTime = dayjs(recentResult.dataTime).format("HH:mm");
        const microDust = recentResult.pm10Value;
        const microDustGrade = measureDustGrade(recentResult.pm10Grade);
        const dubleMicroDust = recentResult.pm25Value;
        const dubleMicroDustGrade = measureDustGrade(recentResult.pm25Grade);
        // grade 1: 좋음 / 2: 보통 / 3: 나쁨 / 4: 매우 나쁨
        const microDustData = {
          presentTime,
          microDust,
          microDustGrade,
          dubleMicroDust,
          dubleMicroDustGrade,
        };

        setMicroDust(microDustData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (address.depth_3 !== "") {
      getMesureCenterXY();
    }
  }, [address]);

  useEffect(() => {
    if (tmXY.tmX !== 0) {
      getMesureCenterName();
    }
  }, [tmXY]);

  useEffect(() => {
    if (measureCenter !== "") {
      getMicroDust();
    }
  }, [measureCenter]);

  return (
    <p className="text-sm flex flex-col items-center">
      <div>{microDust.presentTime} 기준</div>
      <div className="flex flex-row items-center">
        <WiDust className="text-3xl" /> 미세먼지: {microDust.microDust}㎍/㎥ (
        {microDust.microDustGrade})
      </div>

      <div className="flex flex-row items-center">
      <WiDust className="text-3xl" /> 초미세먼지: {microDust.dubleMicroDust}㎍/㎥ (
        {microDust.dubleMicroDustGrade})
      </div>
    </p>
  );
}
