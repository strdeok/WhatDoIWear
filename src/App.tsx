import { useEffect, useRef, useState } from "react";
import { useStore } from "./zustand/state";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoWaterOutline } from "react-icons/io5";
import { GiWindsock } from "react-icons/gi";
import useGetAddress from "./util/GetAddress";
import useGetXY from "./util/GetXY";
import GetNowWeather from "./util/GetNowWeather";
import GetTodayWeather from "./util/GetTodayWeather";
import GetNowSchoolWeather from "./util/GetNowSchoolWeather";
import GetTodaySchoolWeather from "./util/GetTodaySchoolWeather";
import RecommendClothes from "./util/RecommendClothes";
import Modal from "./components/Modal";
import CalculateSummerFeelTemperature from "./util/CalculateSummerFeelTemperature";
import CalculateWinterFeelTemperature from "./util/CalculateWinterFeelTemperature";
import dayjs from "dayjs";
// import GetMesureCenterXY from "./util/GetMesureCenterXY";
// import GetMesureCenterName from "./util/GetMesureCenterName";

function App() {
  const {
    address,
    setAddress,
    xy,
    setXY,
    nowWeather,
    setNowWeather,
    date,
    todayWeather,
    setTodayWeather,
    clothes,
    setClothes,
    editedTime,
    // tmXY,
  }: any = useStore(); // zustand 변수

  // react 훅
  const [activeModal, setActiveModal] = useState(false);
  const [active, setActive] = useState("now");
  const locationRef = useRef({ latitude: 0, longitude: 0 });

  // 커스텀 훅
  const getAddress = useGetAddress(locationRef, setAddress);
  const getNowWeather = GetNowWeather(date, xy, setNowWeather, editedTime);
  const getTodayWeather = GetTodayWeather(date, xy, setTodayWeather);
  const getNowSchoolWeather = GetNowSchoolWeather(
    date,
    setNowWeather,
    editedTime
  );
  const getTodaySchoolWeather = GetTodaySchoolWeather(date, setTodayWeather);
  const getXY = useGetXY(address, setXY);
  const recommendClothes = RecommendClothes(todayWeather, setClothes);
  // const getMesureCenterXY = GetMesureCenterXY()
  // const getMesureCenterName = GetMesureCenterName()



  const school = "송도1동";

  // 현재 위도 경도 토대로 주소 받기기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      locationRef.current.latitude = position.coords.latitude;
      locationRef.current.longitude = position.coords.longitude;
      // 위치가 업데이트 될 때마다 주소를 갱신
      getAddress();
    });
  }, []);

  // 주소를 토대로 XY값 받기기
  useEffect(() => {
    getXY();
  }, [address]);

  // 현재 지역 날씨 || 현재 학교 날씨
  useEffect(() => {
    if (active === "now") {
      getNowWeather();
      getTodayWeather();
    } else {
      getTodaySchoolWeather();
      getNowSchoolWeather();
    }
  }, [xy, active]);

  // 옷 추천하기
  useEffect(() => {
    recommendClothes();
  }, [todayWeather, setTodayWeather]);

  const [feelTemperature, setFeelTemperature] = useState<number>();
  // 체감온도 계산하기
  useEffect(() => {
    const month = Number(dayjs().format("MM"));
    function getFeelsLike(
      temp: number,
      windSpeed: number,
      humidity: number
    ): number {
      if (month <= 9 || month >= 5)
        return CalculateWinterFeelTemperature(temp, windSpeed);
      else if (month >= 10 || month <= 4)
        return CalculateSummerFeelTemperature(temp, humidity);
      else return temp;
    }
    if (nowWeather) {
      setFeelTemperature(
        getFeelsLike(
          nowWeather.temperature,
          nowWeather.wind,
          nowWeather.humidity
        )
      );
    }
  }, [nowWeather]);

  // useEffect(()=>{
  //   getMesureCenterXY()
  //   if(tmXY){
  //     console.log(getMesureCenterName())
  //   }
  // }, [address, tmXY])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center text-white  bg-gradient-to-b from-[#62c1e5] to-[#20a7db] overflow-scroll min-h-[45rem]">
      <main className="relative flex flex-col w-2/3 items-center justify-center gap-8 border-2 p-10 rounded-xl shadow-2xl">
        <div>
          <div>{active === "now" ? address.depth_3 : school}</div>
          <div className="text-xl font-semibold">지금 날씨</div>
          <p className="text-5xl">{nowWeather.temperature}℃</p>
          <br />
          <p className="text-sm">체감온도: {feelTemperature}℃</p>
          <br />
          <p className="flex gap-4 items-center justify-center">
            <IoWaterOutline />
            {nowWeather.humidity}%
          </p>
          <p className="flex gap-4 items-center justify-center">
            <GiWindsock />
            {nowWeather.wind}m/s
          </p>
        </div>

        <div className="text-xs">
          <div className="text-sm">오늘 날씨</div>
          <p>
            최고 {todayWeather.highestTemp}℃ / 최저 {todayWeather.lowestTemp}℃
          </p>
        </div>

        <div>
          <div className="flex flex-row items-center">
            <div className="text-xl mr-2">추천 옷차림</div>
            <div
              onClick={() => {
                setActiveModal(true);
              }}
            >
              <IoIosInformationCircleOutline />
            </div>
          </div>
          {activeModal ? <Modal setActiveModal={setActiveModal} /> : null}

          {clothes.map((element: string) => {
            return <div>{element} </div>;
          })}
        </div>
      </main>
      <div className="w-3/4 mt-14 bottom-5 flex flex-row gap-3 justify-evenly">
        <button
          className={`border rounded-lg p-2 shadow-md ${
            active == "now" ? "bg-[#1a81a9] border-none" : "border-white"
          }`}
          onClick={() => {
            setActive("now");
          }}
        >
          현재 지역 날씨
        </button>

        <button
          className={`border rounded-lg p-2 shadow-md ${
            active != "now" ? "bg-[#1a81a9] border-none" : "border-white"
          }`}
          onClick={() => {
            setActive("school");
          }}
        >
          현재 학교 날씨
        </button>
      </div>
    </div>
  );
}

export default App;
