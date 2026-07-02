"use client";

import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";

type CarouselItemValue = {
  _key?: string;
  caption?: string;
  selectedImageKey?: string;
  isVisible?: boolean;
  project?: {
    _ref?: string;
  };
};

type ProjectImage = {
  _key?: string;
  caption?: string;
  asset?: {
    url?: string;
    originalFilename?: string;
  };
};

type ProjectPreview = {
  _id: string;
  title?: string;
  galleryImages?: ProjectImage[];
};

type HomepageCarouselPreviewInputProps = {
  value?: CarouselItemValue[];
  renderDefault: (props: HomepageCarouselPreviewInputProps) => React.ReactNode;
};

export default function HomepageCarouselPreviewInput(
  props: HomepageCarouselPreviewInputProps,
) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const items = useMemo(() => props.value ?? [], [props.value]);
  const projectIds = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.project?._ref)
            .filter((projectId): projectId is string => Boolean(projectId)),
        ),
      ),
    [items],
  );
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  useEffect(() => {
    if (projectIds.length === 0) {
      const timeoutId = window.setTimeout(() => setProjects([]), 0);

      return () => window.clearTimeout(timeoutId);
    }

    let isCancelled = false;

    client
      .fetch<ProjectPreview[]>(
        `*[_type == "project" && _id in $projectIds] {
          _id,
          title,
          galleryImages[]{
            _key,
            caption,
            asset->{url, originalFilename}
          }
        }`,
        { projectIds },
      )
      .then((result) => {
        if (!isCancelled) {
          setProjects(result ?? []);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [client, projectIds]);

  const previews = items.flatMap((item, index) => {
    const project = projects.find((project) => project._id === item.project?._ref);
    const image = project?.galleryImages?.find(
      (image) => image._key === item.selectedImageKey,
    );

    if (!image?.asset?.url) {
      return [];
    }

    return {
      id: item._key ?? `${project?._id}-${image._key}-${index}`,
      title: item.caption || project?.title || `輪播照片 ${index + 1}`,
      subtitle: image.caption || image.asset.originalFilename || "已挑選照片",
      isVisible: item.isVisible !== false,
      url: image.asset.url,
    };
  });

  return (
    <div>
      {props.renderDefault(props)}

      <section style={previewSectionStyle}>
        <div style={previewHeadingStyle}>
          <strong>已挑選的首頁輪播照片</strong>
          <span>{previews.length} 張</span>
        </div>

        {previews.length > 0 ? (
          <div style={previewGridStyle}>
            {previews.map((preview, index) => (
              <article key={preview.id} style={previewCardStyle}>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  style={imageLinkStyle}
                  title="開啟原始圖片"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={preview.title} style={imageStyle} />
                </a>
                <div style={captionStyle}>
                  <span style={numberStyle}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{preview.title}</strong>
                    <p>{preview.subtitle}</p>
                    <em>{preview.isVisible ? "顯示在首頁" : "已隱藏"}</em>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={emptyStyle}>
            選擇作品集並挑選照片後，這裡會顯示原始圖片預覽。
          </div>
        )}
      </section>
    </div>
  );
}

const previewSectionStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  marginTop: 22,
  padding: 18,
};

const previewHeadingStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 16,
};

const previewGridStyle = {
  display: "grid",
  gap: 18,
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
};

const previewCardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  overflow: "hidden",
};

const imageLinkStyle = {
  background: "#050505",
  display: "block",
};

const imageStyle = {
  display: "block",
  height: 280,
  objectFit: "contain" as const,
  width: "100%",
};

const captionStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: 12,
  padding: 14,
};

const numberStyle = {
  color: "#c9a46a",
  fontSize: 12,
  letterSpacing: "0.16em",
};

const emptyStyle = {
  border: "1px dashed rgba(255,255,255,0.16)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.58)",
  padding: 22,
  textAlign: "center" as const,
};
