"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import MobileShell from "../mobile/MobileShell";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

type FilmFilter = {
  id: string;
  label: string;
  caption: string;
  brand: string;
  stamp: string;
  css: string;
  grain: number;
  vignette: number;
  lightLeak: "none" | "warm-left" | "red-top" | "blue-shadow";
  border: "classic" | "instant" | "cinema" | "date";
};

const filmFilters: FilmFilter[] = [
  {
    id: "kodak400",
    label: "400",
    caption: "Warm everyday film",
    brand: "KODAK 400",
    stamp: "KAKU 400",
    css: "contrast(1.08) saturate(0.92) sepia(0.18) brightness(1.02)",
    grain: 20,
    vignette: 0.34,
    lightLeak: "warm-left",
    border: "classic",
  },
  {
    id: "fuji200",
    label: "FUJI",
    caption: "Green soft tone",
    brand: "FUJI 200",
    stamp: "FUJI 200",
    css: "contrast(0.96) saturate(0.88) hue-rotate(8deg) brightness(1.04)",
    grain: 14,
    vignette: 0.24,
    lightLeak: "blue-shadow",
    border: "date",
  },
  {
    id: "ilfordhp5",
    label: "BW",
    caption: "High contrast B/W",
    brand: "ILFORD HP5",
    stamp: "HP5 PLUS",
    css: "grayscale(1) contrast(1.28) brightness(0.94)",
    grain: 34,
    vignette: 0.42,
    lightLeak: "none",
    border: "cinema",
  },
  {
    id: "cinestill800",
    label: "800T",
    caption: "Night tungsten glow",
    brand: "CINESTILL 800T",
    stamp: "800T",
    css: "contrast(1.12) saturate(1.16) brightness(0.96) hue-rotate(-6deg)",
    grain: 28,
    vignette: 0.38,
    lightLeak: "red-top",
    border: "classic",
  },
];

const photoWidth = 1080;
const photoHeight = 1350;
const framePaddingX = 96;
const framePaddingY = 64;
const outputWidth = photoWidth + framePaddingX * 2;
const outputHeight = photoHeight + framePaddingY * 2;
const outputPhotoFrame = {
  x: framePaddingX,
  y: framePaddingY,
  width: photoWidth,
  height: photoHeight,
};

const getTodayStamp = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yy}.${mm}.${dd}`;
};

const drawFilmEffects = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilmFilter,
) => {
  // 暗角
  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.15,
    width / 2,
    height / 2,
    width * 0.74,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, `rgba(0,0,0,${filter.vignette})`);
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  // 光漏
  if (filter.lightLeak === "warm-left") {
    const leak = context.createLinearGradient(0, 0, width * 0.65, height);
    leak.addColorStop(0, "rgba(236, 178, 82, 0.35)");
    leak.addColorStop(0.35, "rgba(194, 86, 38, 0.16)");
    leak.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = leak;
    context.fillRect(0, 0, width, height);
  }

  if (filter.lightLeak === "red-top") {
    const leak = context.createLinearGradient(0, 0, width, height * 0.45);
    leak.addColorStop(0, "rgba(255, 86, 58, 0.34)");
    leak.addColorStop(0.38, "rgba(255, 173, 83, 0.13)");
    leak.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = leak;
    context.fillRect(0, 0, width, height);
  }

  if (filter.lightLeak === "blue-shadow") {
    const leak = context.createLinearGradient(width, height, 0, 0);
    leak.addColorStop(0, "rgba(60, 98, 120, 0.24)");
    leak.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    context.fillStyle = leak;
    context.fillRect(0, 0, width, height);
  }

  // 顆粒
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * filter.grain;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }

  context.putImageData(imageData, 0, 0);

  // 底片邊框 / 日期 / 品牌字
  drawFilmBorder(context, width, height, filter);
};

const drawFilmBorder = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilmFilter,
) => {
  const date = getTodayStamp();

  context.save();

  if (filter.border === "instant") {
    context.fillStyle = "rgba(245, 238, 220, 0.92)";
    context.fillRect(0, 0, width, height);
    context.clearRect(42, 42, width - 84, height - 170);

    context.fillStyle = "rgba(22, 18, 14, 0.72)";
    context.font = "28px sans-serif";
    context.fillText(filter.brand, 54, height - 72);
    context.fillText(date, width - 190, height - 72);
  }

  if (filter.border === "classic") {
    context.fillStyle = "rgba(5, 5, 5, 0.72)";
    context.fillRect(0, height - 92, width, 92);

    context.fillStyle = "rgba(243,238,230,0.78)";
    context.font = "26px sans-serif";
    context.fillText(filter.stamp, 44, height - 38);

    context.fillStyle = "rgba(216,177,111,0.78)";
    context.font = "22px sans-serif";
    context.fillText(date, width - 172, height - 38);
  }

  if (filter.border === "cinema") {
    context.fillStyle = "rgba(0, 0, 0, 0.82)";
    context.fillRect(0, 0, width, 74);
    context.fillRect(0, height - 74, width, 74);

    context.fillStyle = "rgba(243,238,230,0.68)";
    context.font = "22px sans-serif";
    context.fillText(filter.brand, 44, height - 30);
    context.fillText("FRAME 24", width - 180, height - 30);
  }

  if (filter.border === "date") {
    context.fillStyle = "rgba(255, 118, 48, 0.82)";
    context.font = "30px monospace";
    context.fillText(date, width - 190, height - 48);

    context.fillStyle = "rgba(243,238,230,0.58)";
    context.font = "22px sans-serif";
    context.fillText(filter.brand, 44, height - 48);
  }

  context.restore();
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const right = x + width;
  const bottom = y + height;

  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(right - radius, y);
  context.quadraticCurveTo(right, y, right, y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(x + radius, bottom);
  context.quadraticCurveTo(x, bottom, x, bottom - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const drawOutputFilmFrame = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: { x: number; y: number; width: number; height: number },
) => {
  context.fillStyle = "#2c221d";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#050505";

  const sprocketCount = 8;
  const sprocketWidth = 18;
  const sprocketHeight = 34;
  const sprocketRadius = 9;
  const sprocketInsetX = 18;
  const sprocketTop = 36;
  const sprocketBottom = height - 36 - sprocketHeight;
  const sprocketGap =
    sprocketCount > 1
      ? (sprocketBottom - sprocketTop) / (sprocketCount - 1)
      : 0;

  Array.from({ length: sprocketCount }).forEach((_, index) => {
    const y = sprocketTop + sprocketGap * index;

    drawRoundedRect(
      context,
      sprocketInsetX,
      y,
      sprocketWidth,
      sprocketHeight,
      sprocketRadius,
    );
    context.fill();

    drawRoundedRect(
      context,
      width - sprocketInsetX - sprocketWidth,
      y,
      sprocketWidth,
      sprocketHeight,
      sprocketRadius,
    );
    context.fill();
  });

  context.fillStyle = "#120f0d";
  context.fillRect(frame.x, frame.y, frame.width, frame.height);

  context.strokeStyle = "rgba(0,0,0,0.5)";
  context.lineWidth = 4;
  context.strokeRect(frame.x + 2, frame.y + 2, frame.width - 4, frame.height - 4);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const renderDevelopedPhoto = async (rawPhotoUrl: string, filter: FilmFilter) => {
  const image = await loadImage(rawPhotoUrl);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const photoCanvas = document.createElement("canvas");
  photoCanvas.width = photoWidth;
  photoCanvas.height = photoHeight;

  const photoContext = photoCanvas.getContext("2d");
  if (!photoContext) {
    return "";
  }

  photoContext.filter = filter.css;
  photoContext.drawImage(image, 0, 0, photoWidth, photoHeight);
  photoContext.filter = "none";

  drawFilmEffects(photoContext, photoWidth, photoHeight, filter);

  drawOutputFilmFrame(context, outputWidth, outputHeight, outputPhotoFrame);
  context.drawImage(
    photoCanvas,
    outputPhotoFrame.x,
    outputPhotoFrame.y,
    outputPhotoFrame.width,
    outputPhotoFrame.height,
  );
  context.strokeStyle = "rgba(0,0,0,0.5)";
  context.lineWidth = 4;
  context.strokeRect(
    outputPhotoFrame.x + 2,
    outputPhotoFrame.y + 2,
    outputPhotoFrame.width - 4,
    outputPhotoFrame.height - 4,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
};

export default function MobileContact() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const renderVersionRef = useRef(0);

  const [selectedFilter, setSelectedFilter] = useState<FilmFilter>(
    filmFilters[0],
  );
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [rawPhotoUrl, setRawPhotoUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");

  const startCamera = async () => {
    try {
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch {
      setCameraError("Camera permission is needed to develop this frame.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isCameraReady) return;

    setIsDeveloping(true);

    canvas.width = photoWidth;
    canvas.height = photoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = photoWidth / photoHeight;

    let drawWidth = photoWidth;
    let drawHeight = photoHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (videoRatio > canvasRatio) {
      drawHeight = photoHeight;
      drawWidth = photoHeight * videoRatio;
      offsetX = (photoWidth - drawWidth) / 2;
    } else {
      drawWidth = photoWidth;
      drawHeight = photoWidth / videoRatio;
      offsetY = (photoHeight - drawHeight) / 2;
    }

    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    setRawPhotoUrl(canvas.toDataURL("image/jpeg", 0.96));
  };

  const retakePhoto = () => {
    setRawPhotoUrl(null);
    setPhotoUrl(null);
  };

  useEffect(() => {
    if (!rawPhotoUrl) {
      return;
    }

    let isCancelled = false;
    const renderVersion = renderVersionRef.current + 1;
    renderVersionRef.current = renderVersion;

    renderDevelopedPhoto(rawPhotoUrl, selectedFilter)
      .then((developedPhotoUrl) => {
        if (
          isCancelled ||
          renderVersionRef.current !== renderVersion ||
          !developedPhotoUrl
        ) {
          return;
        }

        setPhotoUrl(developedPhotoUrl);
      })
      .finally(() => {
        if (!isCancelled && renderVersionRef.current === renderVersion) {
          setIsDeveloping(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [rawPhotoUrl, selectedFilter]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[#050505] px-5 py-7 text-[#f3eee6]">
        <P5Sketch intensity="low" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(216,177,111,0.12),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(120,65,32,0.16),transparent_38%)]" />

        <section className="relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-col">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-[#c9a46a]">
                KAKU PHOTOGRAPHY
              </p>
              <h1 className="mt-4 text-4xl font-light uppercase tracking-[0.12em]">
                FILM
              </h1>
            </div>

            <p className="pt-1 text-right text-[10px] uppercase leading-5 tracking-[0.28em] text-[rgba(243,238,230,0.48)]">
              Film
              <br />
              Booth
            </p>
          </header>

          <p className="mt-6 max-w-[17rem] text-lg font-light leading-8 text-[rgba(243,238,230,0.78)]">
            Turn this moment into a small piece of film.
          </p>

          <div className="mt-7">
            <div className="relative bg-[#2c221d] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.36)]">
              <div className="pointer-events-none absolute inset-y-3 left-1.5 flex flex-col justify-between">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={`left-${index}`}
                    className="h-2.5 w-1.5 rounded-full bg-[#050505]"
                  />
                ))}
              </div>

              <div className="pointer-events-none absolute inset-y-3 right-1.5 flex flex-col justify-between">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={`right-${index}`}
                    className="h-2.5 w-1.5 rounded-full bg-[#050505]"
                  />
                ))}
              </div>

              <div className="relative mx-4 aspect-[4/5] overflow-hidden border border-black/50 bg-[#120f0d]">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={[
                    "h-full w-full object-cover",
                    photoUrl ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                  style={{ filter: selectedFilter.css }}
                />

                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Developed film frame"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}

                {!isCameraReady && !photoUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-6 text-center">
                    <p className="text-xs uppercase tracking-[0.34em] text-[#c9a46a]">
                      Camera standby
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-5 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.26em] text-[#f3eee6]"
                    >
                      Open Camera
                    </button>

                    {cameraError && (
                      <p className="mt-5 text-xs leading-5 text-[rgba(243,238,230,0.48)]">
                        {cameraError}
                      </p>
                    )}
                  </div>
                )}

                {isDeveloping && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs uppercase tracking-[0.36em] text-black">
                    Developing...
                  </div>
                )}

                <div className="pointer-events-none absolute left-4 top-4 text-[9px] uppercase tracking-[0.28em] text-[rgba(243,238,230,0.72)]">
                  {selectedFilter.brand}
                </div>

                <div className="pointer-events-none absolute right-4 top-4 text-[9px] uppercase tracking-[0.24em] text-[#c9a46a]">
                  {selectedFilter.id === "ilfordhp5" ? "FRAME 24" : getTodayStamp()}
                </div>

                <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-between text-[9px] uppercase tracking-[0.22em] text-[rgba(243,238,230,0.62)]">
                  <span>ISO 400</span>
                  <span>f/2.8</span>
                  <span>1/60</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.36em] text-[#c9a46a]">
              Film Stock
            </p>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {filmFilters.map((filter) => {
                const isActive = selectedFilter.id === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => {
                      if (rawPhotoUrl) {
                        setIsDeveloping(true);
                      }

                      setSelectedFilter(filter);
                    }}
                    className={[
                      "flex flex-col items-center gap-2 rounded-full border px-2 py-3 transition",
                      isActive
                        ? "border-[#c9a46a] text-[#f3eee6]"
                        : "border-white/10 text-[rgba(243,238,230,0.48)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-8 w-8 rounded-full border",
                        isActive
                          ? "border-[#c9a46a] bg-[#c9a46a]/18"
                          : "border-white/20 bg-white/5",
                      ].join(" ")}
                    />
                    <span className="text-[10px] uppercase tracking-[0.18em]">
                      {filter.label}
                    </span>
                    <span className="max-w-[4.5rem] text-center text-[8px] uppercase leading-3 tracking-[0.08em] text-[rgba(243,238,230,0.38)]">
                      {filter.caption}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto flex flex-col items-center pt-8">
            {!photoUrl ? (
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!isCameraReady || isDeveloping}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a46a]/80 disabled:border-white/10 disabled:opacity-40"
                aria-label="Capture film photo"
              >
                <span className="h-14 w-14 rounded-full border border-[#f3eee6] bg-[#f3eee6]/8" />
              </button>
            ) : (
              <div className="flex w-full items-center justify-center gap-8">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="border-b border-white/20 pb-2 text-xs uppercase tracking-[0.24em] text-[rgba(243,238,230,0.64)]"
                >
                  Retake
                </button>

                <a
                  href={photoUrl}
                  download={`kaku-film-${selectedFilter.label}.jpg`}
                  className="border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.24em] text-[#c9a46a]"
                >
                  Save
                </a>
              </div>
            )}

            <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-[rgba(243,238,230,0.42)]">
              {photoUrl ? "Frame developed" : "Tap to capture"}
            </p>
          </div>
        </section>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </MobileShell>
  );
}
