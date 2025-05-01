import { useEffect, useState } from "react";
import { useStore } from "../zustand/state";
import RecommendClothes from "../util/RecommendClothes";

export default function RecommendedClothes() {
  const { highestTemp }: any = useStore();
  const [clothes, setClothes] = useState<string[]>([""]);

  useEffect(() => {
    const getRecommendedClothes = async () => {
      await RecommendClothes(highestTemp).then((res) => {
        setClothes(res);
      });
    };
    getRecommendedClothes()
  }, [highestTemp]);

  return (
    <>
      {clothes?.map((element: string) => {
        return <div>{element}</div>;
      })}
    </>
  );
}
