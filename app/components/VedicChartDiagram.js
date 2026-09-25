"use client";

import { BOX_SIZE, HOUSE_SHAPES, polygonToPath, signIndexForHouse } from "@/lib/kundliChartGeometry";
import { PLANET_ABBR } from "@/lib/vedicKnowledge";

// North Indian style diamond chart — houses are fixed geometric positions
// (lib/kundliChartGeometry.js); only the rashi number shown per house
// rotates with houseBaseSignIndex (the Ascendant, or the Moon sign when
// birth time wasn't provided).
export default function VedicChartDiagram({ houseBaseSignIndex, planets, lang = "en" }) {
  if (houseBaseSignIndex == null) return null;

  const planetsByHouse = {};
  Object.entries(planets || {}).forEach(([key, data]) => {
    if (!data || data.house == null) return;
    if (!planetsByHouse[data.house]) planetsByHouse[data.house] = [];
    planetsByHouse[data.house].push(PLANET_ABBR[key]?.[lang] || key);
  });

  return (
    <svg
      viewBox={`0 0 ${BOX_SIZE} ${BOX_SIZE}`}
      width="100%"
      style={{ maxWidth: 320, display: "block", margin: "0 auto" }}
      role="img"
      aria-label={lang === "hi" ? "कुंडली चार्ट" : "Kundli chart"}
    >
      <rect x="0" y="0" width={BOX_SIZE} height={BOX_SIZE} fill="var(--panel, #f3e4be)" />
      {Object.entries(HOUSE_SHAPES).map(([houseNum, shape]) => (
        <path
          key={houseNum}
          d={polygonToPath(shape.points)}
          fill="none"
          stroke="var(--maroon-deep, #591019)"
          strokeWidth="1.5"
        />
      ))}
      {Object.entries(HOUSE_SHAPES).map(([houseNum, shape]) => {
        const signIndex = signIndexForHouse(houseBaseSignIndex, Number(houseNum));
        const planetLabels = planetsByHouse[houseNum] || [];
        return (
          <g key={`label-${houseNum}`}>
            <text
              x={shape.anchor[0]}
              y={shape.anchor[1] - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--ink-soft, #5a4531)"
            >
              {signIndex + 1}
            </text>
            {planetLabels.length > 0 && (
              <text
                x={shape.anchor[0]}
                y={shape.anchor[1] + 10}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="var(--maroon, #7a1220)"
              >
                {planetLabels.join(" ")}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
