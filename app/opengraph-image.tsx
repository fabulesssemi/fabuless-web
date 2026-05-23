import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Fabuless — The semiconductor briefing for serious investors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const fontData = readFileSync(
    join(process.cwd(), "public/fonts/PlayfairDisplay-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        {/* Amber top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "#B45309",
          }}
        />

        {/* EVERY FRIDAY label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          <div style={{ width: "32px", height: "2px", background: "#B45309" }} />
          <div
            style={{
              color: "#B45309",
              fontSize: "15px",
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "3px",
            }}
          >
            EVERY FRIDAY
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            color: "#F8FAFC",
            fontSize: "130px",
            fontFamily: "Playfair",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-3px",
            marginBottom: "32px",
          }}
        >
          Fabuless
        </div>

        {/* Divider */}
        <div
          style={{
            width: "80px",
            height: "3px",
            background: "#334155",
            marginBottom: "28px",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            color: "#94A3B8",
            fontSize: "28px",
            fontFamily: "sans-serif",
            lineHeight: 1.5,
            maxWidth: "640px",
          }}
        >
          The semiconductor briefing for serious investors.
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "80px",
            color: "#475569",
            fontSize: "20px",
            fontFamily: "sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          fabuless.ai
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Playfair", data: fontData, weight: 700 }],
    }
  );
}
