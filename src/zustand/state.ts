import dayjs from "dayjs";
import { create } from "zustand";

export const useStore = create((set) => ({
  date: dayjs().format("YYYYMMDD"),
  hour: Number(dayjs().format("HH")),
  minute: Number(dayjs().format("mm")),

  address: {},
  setAddress: () => set((state: object) => ({ address: state })),

  xy: {
    x: 0,
    y: 0,
  },
  setXY: () => set((state: object) => ({ xy: state })),

  nowWeather: {
    temperature: "",
    humidity: "",
    wind: "",
  },
  setNowWeather: () => set((state: object) => ({ nowWeather: state })),

  todayWeather: {
    highestTemp: "",
    lowestTemp: "",
    todayWind: "",
  },
  setTodayWeather: () =>
    set((state: object) => ({
      todayWeather: state,
    })),

  clothes: [],
  setClothes: () => set((state: string[]) => ({ clothes: state })),
}));
