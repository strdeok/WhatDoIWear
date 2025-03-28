import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { WiDust } from "@react-icons/all-files/wi/WiDust";
import { IoIosInformationCircleOutline } from "@react-icons/all-files/io/IoIosInformationCircleOutline";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { RiSurgicalMaskLine } from "@react-icons/all-files/ri/RiSurgicalMaskLine";
import { GiGasMask } from "@react-icons/all-files/gi/GiGasMask";
interface TMXY {
  tmX: number;
  tmY: number;
}

interface MicroDust {
  presentTime: string;
  microDust: string;
  microDustGrade: string | undefined;
  doubleMicroDust: string;
  doubleMicroDustGrade: string | undefined;
}

export default function GetMicroDust({
  address,
}: {
  address: { depth_3: string };
}) {
  const [microDust, setMicroDust] = useState<MicroDust>({
    presentTime: "",
    microDust: "",
    microDustGrade: "",
    doubleMicroDust: "",
    doubleMicroDustGrade: "",
  });
  const [modalState, setModalState] = useState(false);

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

  const getMesureCenterXY = async () => {
    const res = await axios.get(
      `https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getTMStdrCrdnt?serviceKey=${
        import.meta.env.VITE_PUBLIC_API_KEY
      }&returnType=JSON&numOfRows=100&pageNo=1&umdName=${address.depth_3}`
    );

    if (!res.data.response) {
      return null;
    } else {
      const tmXY: TMXY = {
        tmX: res.data.response.body.items[0].tmX,
        tmY: res.data.response.body.items[0].tmY,
      };
      return tmXY;
    }
  };

  const getMesureCenterName = async (tmXY: TMXY) => {
    const res = await axios.get(
      `https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList?serviceKey=${
        import.meta.env.VITE_PUBLIC_API_KEY
      }&returnType=JSON&tmX=${tmXY.tmX}&tmY=${tmXY.tmY}&ver=1.1`
    );
    return res.data.response.body.items[0].stationName;
  };

  const getMicroDust = async (measureCenter: string) => {
    const res = await axios.get(
      `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${
        import.meta.env.VITE_PUBLIC_API_KEY
      }&returnType=JSON&stationName=${measureCenter}&dataTerm=DAILY&pageNo=1&numOfRow=10&ver=1.3`
    );

    const recentResult = res.data.response.body.items[0];
    const presentTime = dayjs(recentResult.dataTime).format("HH:mm");
    const microDust = recentResult.pm10Value;
    const microDustGrade = measureDustGrade(recentResult.pm10Grade1h);
    const doubleMicroDust = recentResult.pm25Value;
    const doubleMicroDustGrade = measureDustGrade(recentResult.pm25Grade1h);
    // grade 1: 좋음 / 2: 보통 / 3: 나쁨 / 4: 매우 나쁨
    const microDustData = {
      presentTime,
      microDust,
      microDustGrade,
      doubleMicroDust,
      doubleMicroDustGrade,
    };
    setMicroDust(microDustData);
  };

  useEffect(() => {
    const getCenterXY = new Promise<TMXY | null>((resolve) => {
      resolve(getMesureCenterXY());
    }).catch((err) => {
      console.log(err);
    });

    getCenterXY
      .then((tmXY): Promise<string> => {
        if (tmXY === undefined) {
          setMicroDust({ ...microDust, microDust: "" });
        }
        return getMesureCenterName(tmXY as TMXY);
      })
      .then((measureCenterName) => {
        getMicroDust(measureCenterName);
        console.log(measureCenterName);
      });
  }, [address]);

  const EquipmentForMicroDust = () => {
    switch (microDust.microDustGrade || microDust.doubleMicroDustGrade) {
      case "좋음":
        return null;
      case "보통":
      case "나쁨":
        return (
          <div className="flex flex-row items-center gap-2">
            <RiSurgicalMaskLine />
            마스크 착용을 권장합니다.
          </div>
        );
      case "매우나쁨":
        return (
          <div className="flex flex-row items-center gap-2">
            <GiGasMask />
            마스크를 꼭 착용하세요!
          </div>
        );
      default:
        "";
    }
  };

  if (microDust.microDust !== "")
    return (
      <div className="text-sm flex flex-col items-center">
        <div className="w-full flex flex-row items-center justify-center ">
          {microDust.presentTime} 기준{" "}
          <IoIosInformationCircleOutline
            className="ml-2"
            onClick={() => {
              setModalState(true);
            }}
          />
        </div>
        <div className="flex flex-row items-center">
          <WiDust className="text-3xl" /> 미세먼지: {microDust.microDust}㎍/㎥ (
          {microDust.microDustGrade})
        </div>

        <div className="flex flex-row items-center">
          <WiDust className="text-3xl" /> 초미세먼지:{" "}
          {microDust.doubleMicroDust}
          ㎍/㎥ ({microDust.doubleMicroDustGrade})
        </div>
        <EquipmentForMicroDust />

        {modalState ? (
          <div className="absolute bg-white text-black border border-black rounded-xl p-3 left-0">
            <p
              className="float-right"
              onClick={() => {
                setModalState(false);
              }}
            >
              <IoMdClose />
            </p>
            <div className="float-end">
              <p>
                인증을 받지 않은 실시간 자료이기 때문에 자료 오류 및 표출방식에
                따라 값이 다를 수 있습니다.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
}
