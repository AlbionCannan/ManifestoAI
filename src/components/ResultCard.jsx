import React from "react";

export default function ResultCard({ title, score }) {
  const cls = score>8 ? "pos" : score<-8 ? "neg" : "neu";
  const sign = score>0?"+":"";
  return (
    <div className="kpi">
      <h4>{title}</h4>
      <div className={`score ${cls}`}>{sign}{score}</div>
    </div>
  );
}
