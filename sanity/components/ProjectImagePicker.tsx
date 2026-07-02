"use client";

import { useEffect, useMemo, useState } from "react";
import { set, unset, useClient, useFormValue } from "sanity";
import type { StringInputProps, StringSchemaType } from "sanity";

type ProjectImage = {
  _key: string;
  caption?: string;
  asset?: {
    url?: string;
  };
};

export default function ProjectImagePicker({
  path,
  value,
  onChange,
}: StringInputProps<StringSchemaType>) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const parentPath = useMemo(() => path.slice(0, -1), [path]);
  const project = useFormValue([...parentPath, "project"]) as
    | { _ref?: string }
    | undefined;
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const isLoading = Boolean(project?._ref && loadedProjectId !== project._ref);

  useEffect(() => {
    if (!project?._ref) {
      return;
    }

    let isCancelled = false;

    client
      .fetch<ProjectImage[]>(
        `*[_type == "project" && _id == $projectId][0].galleryImages[]{
          _key,
          caption,
          asset->{url}
        }`,
        { projectId: project._ref },
      )
      .then((result) => {
        if (isCancelled) {
          return;
        }

        setImages(result?.filter((item) => item?.asset?.url) ?? []);
        setLoadedProjectId(project._ref ?? null);
      });

    return () => {
      isCancelled = true;
    };
  }, [client, project?._ref]);

  if (!project?._ref) {
    return (
      <div style={noticeStyle}>請先選擇來源作品集，再挑選輪播照片。</div>
    );
  }

  if (isLoading) {
    return (
      <div style={noticeStyle}>正在讀取作品照片...</div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={noticeStyle}>這個作品集還沒有照片，請先到作品管理上傳照片。</div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
        }}
      >
        {images.map((item) => {
          const isSelected = value === item._key;

          return (
            <button
              key={item._key}
              type="button"
              style={{
                background: isSelected ? "rgba(201,164,106,0.18)" : "rgba(255,255,255,0.04)",
                border: isSelected ? "2px solid #c9a46a" : "1px solid rgba(255,255,255,0.14)",
                cursor: "pointer",
                color: "inherit",
                padding: 8,
                textAlign: "left",
              }}
              onClick={() => onChange(set(item._key))}
            >
              <div
                style={{
                  aspectRatio: "4 / 5",
                  backgroundImage: `url(${item.asset?.url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
              <div style={{ fontSize: 13, marginTop: 8, opacity: isSelected ? 1 : 0.68 }}>
                {item.caption || (isSelected ? "已選擇" : "點選此照片")}
              </div>
            </button>
          );
        })}
      </div>

      {value ? (
        <button
          type="button"
          onClick={() => onChange(unset())}
          style={{
            marginTop: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            padding: "8px 12px",
          }}
        >
          清除選擇
        </button>
      ) : null}
    </div>
  );
}

const noticeStyle = {
  border: "1px solid rgba(201,164,106,0.35)",
  background: "rgba(201,164,106,0.08)",
  borderRadius: 6,
  fontSize: 15,
  lineHeight: 1.7,
  padding: 16,
};
