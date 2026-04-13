import { useRef } from "react";

export default function StarField() {
  const stars = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 0.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: Math.random() * 4 + 2,
      op: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 4,
    }))
  ).current;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: "white",
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            "--dur": `${s.dur}s`,
            "--op": s.op,
            animationDelay: `${s.delay}s`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            opacity: s.op,
          }}
        />
      ))}
    </div>
  );
}