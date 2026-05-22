import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fabuless — The semiconductor briefing for serious investors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111827",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0 80px 60px 80px",
        }}
      >
        {/* Amber top accent bar */}
        <div style={{ width: "100%", height: "6px", background: "#B45309" }} />

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              color: "#F9FAFB",
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-2px",
              fontFamily: "serif",
            }}
          >
            Fabuless
          </div>
          <div
            style={{
              color: "#9CA3AF",
              fontSize: 34,
              lineHeight: 1.4,
              maxWidth: "720px",
              fontFamily: "sans-serif",
            }}
          >
            The semiconductor briefing for serious investors.
          </div>
        </div>

        {/* Bottom: URL + cadence */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#6B7280",
              fontSize: 24,
              fontFamily: "sans-serif",
            }}
          >
            fabuless.ai
          </div>
          <div
            style={{
              color: "#B45309",
              fontSize: 20,
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Every Friday
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
