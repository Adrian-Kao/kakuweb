"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { ArrayOfObjectsInputProps } from "sanity";
import { set, useClient } from "sanity";

type PortfolioImageValue = {
  _key: string;
  _type?: "image";
  asset?: {
    _type?: "reference";
    _ref?: string;
  };
};

const apiVersion = "2025-01-01";

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export default function PortfolioImageManager(
  props: ArrayOfObjectsInputProps<PortfolioImageValue>,
) {
  const client = useClient({ apiVersion });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const images = props.value ?? [];
  const imageBuilder = createImageUrlBuilder(client);

  function getImageUrl(image: PortfolioImageValue) {
    if (!image.asset?._ref) {
      return "";
    }

    return imageBuilder.image(image).width(900).auto("format").url();
  }

  useEffect(() => {
    folderInputRef.current?.setAttribute("webkitdirectory", "");
    folderInputRef.current?.setAttribute("directory", "");
  }, []);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    setMessage("正在上傳照片...");

    try {
      const uploadedImages: PortfolioImageValue[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const asset = await client.assets.upload("image", file, {
          filename: file.name,
        });

        uploadedImages.push({
          _type: "image",
          _key: makeKey(),
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        });
      }

      if (uploadedImages.length > 0) {
        props.onChange(set([...images, ...uploadedImages]));
      }

      setMessage(`已加入 ${uploadedImages.length} 張照片，請按右下角 Publish。`);
    } catch (error) {
      console.error(error);
      setMessage("上傳失敗，請稍後再試。");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    props.onChange(set(images.filter((_, imageIndex) => imageIndex !== index)));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }

    const nextImages = [...images];
    [nextImages[index], nextImages[nextIndex]] = [
      nextImages[nextIndex],
      nextImages[index],
    ];
    props.onChange(set(nextImages));
  }

  return (
    <div className="kaku-portfolio-manager">
      <div className="kaku-portfolio-toolbar">
        <div>
          <h2>Portfolio 照片</h2>
          <p>可選擇單張、多張，或直接選擇整個資料夾。</p>
        </div>

        <div className="kaku-portfolio-actions">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            上傳照片
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => folderInputRef.current?.click()}
          >
            上傳資料夾
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void uploadFiles(event.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void uploadFiles(event.target.files)}
      />

      {message ? <p className="kaku-portfolio-message">{message}</p> : null}

      {images.length > 0 ? (
        <div className="kaku-portfolio-grid">
          {images.map((image, index) => (
            <article key={image._key ?? `${getImageUrl(image)}-${index}`}>
              {getImageUrl(image) ? (
                <img src={getImageUrl(image)} alt="" />
              ) : (
                <div className="kaku-portfolio-placeholder">等待圖片資料</div>
              )}
              <div className="kaku-portfolio-card-actions">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  aria-label="往前移動"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  aria-label="往後移動"
                >
                  →
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removeImage(index)}
                >
                  移除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="kaku-portfolio-empty"
          onClick={() => fileInputRef.current?.click()}
        >
          尚未上傳 Portfolio 照片
        </button>
      )}

      <style jsx>{`
        .kaku-portfolio-manager {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          padding: 8px 0 32px;
        }

        .kaku-portfolio-toolbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        h2 {
          margin: 0 0 8px;
          font-size: 1.35rem;
        }

        p {
          margin: 0;
          color: #a8a8b3;
        }

        .kaku-portfolio-actions {
          display: flex;
          gap: 12px;
        }

        button {
          min-height: 42px;
          border: 1px solid #3b3b46;
          border-radius: 6px;
          background: #202027;
          color: #f3f3f4;
          padding: 0 16px;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          border-color: #7d8ff8;
          background: #292b3c;
        }

        button:disabled {
          cursor: default;
          opacity: 0.35;
        }

        .kaku-portfolio-message {
          margin-bottom: 18px;
          color: #c9a46a;
        }

        .kaku-portfolio-grid {
          columns: 280px 3;
          column-gap: 18px;
          width: 100%;
          max-width: 100%;
        }

        article {
          break-inside: avoid;
          overflow: hidden;
          margin: 0 0 18px;
          border: 1px solid #303039;
          border-radius: 6px;
          background: #17171c;
        }

        article img {
          display: block;
          width: 100%;
          height: auto;
        }

        .kaku-portfolio-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
        }

        .kaku-portfolio-card-actions span {
          margin-right: auto;
          color: #c9a46a;
          font-size: 0.78rem;
        }

        .kaku-portfolio-card-actions button {
          min-height: 34px;
          padding: 0 11px;
        }

        .kaku-portfolio-card-actions .danger {
          border-color: #6f3a42;
          color: #ff9aa7;
        }

        .kaku-portfolio-placeholder,
        .kaku-portfolio-empty {
          display: grid;
          min-height: 180px;
          place-items: center;
          color: #8f8f99;
        }

        .kaku-portfolio-empty {
          width: 100%;
          border-style: dashed;
        }

        @media (max-width: 760px) {
          .kaku-portfolio-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .kaku-portfolio-actions button {
            flex: 1;
          }

          .kaku-portfolio-grid {
            columns: 1;
          }
        }
      `}</style>
    </div>
  );
}
