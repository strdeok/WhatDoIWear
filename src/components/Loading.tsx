import "./loading.css";

export default function Loading() {
  return (
    <div className="absolute bg-black bg-opacity-75 w-full h-screen z-10 flex items-center justify-center"  >
      <span className="loader">날씨를 불러오는 중</span>
    </div>
  );
}
