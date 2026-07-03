"use client";

import { useEffect, useMemo, useState } from "react";
import { set, useClient } from "sanity";

type CarouselItemValue = {
  _key?: string;
  _type?: "carouselItem";
  selectedImageKey?: string;
  isVisible?: boolean;
  project?: {
    _type?: "reference";
    _ref?: string;
  };
};

type CategoryPreview = {
  _id: string;
  title?: string;
  order?: number;
  parentCategory?: {
    _id: string;
    title?: string;
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
  categories?: CategoryPreview[];
  galleryImages?: ProjectImage[];
  coverImage?: {
    asset?: {
      url?: string;
    };
  };
};

type HomepageCarouselPreviewInputProps = {
  value?: CarouselItemValue[];
  onChange: (patch: unknown) => void;
};

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function getProjectTitle(project?: ProjectPreview | null) {
  return project?.title?.trim() || "未命名作品集";
}

function getImageUrl(image?: ProjectImage | null) {
  return image?.asset?.url ?? "";
}

function getImageLabel(image?: ProjectImage | null, index = 0) {
  return image?.caption || image?.asset?.originalFilename || `照片 ${index + 1}`;
}

export default function HomepageCarouselPreviewInput({
  value,
  onChange,
}: HomepageCarouselPreviewInputProps) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const items = useMemo(() => value ?? [], [value]);
  const [categories, setCategories] = useState<CategoryPreview[]>([]);
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      client.fetch<CategoryPreview[]>(
        `*[_type == "category"] | order(order asc, title asc) {
          _id,
          title,
          order,
          parentCategory->{ _id, title }
        }`,
      ),
      client.fetch<ProjectPreview[]>(
        `*[_type == "project"] | order(shootingDate desc, _updatedAt desc) {
          _id,
          title,
          coverImage{asset->{url}},
          galleryImages[]{_key, caption, asset->{url, originalFilename}},
          categories[]->{ _id, title, parentCategory->{ _id, title } }
        }`,
      ),
    ]).then(([categoryDocs, projectDocs]) => {
      if (isCancelled) {
        return;
      }

      setCategories(categoryDocs ?? []);
      setProjects(projectDocs ?? []);
      setSelectedProjectId((current) => current ?? projectDocs?.[0]?._id ?? null);
      setExpandedCategoryIds((current) =>
        current.length > 0
          ? current
          : (categoryDocs ?? [])
              .filter((category) => !category.parentCategory)
              .slice(0, 4)
              .map((category) => category._id),
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [client]);

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentCategory),
    [categories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryPreview[]>();

    categories.forEach((category) => {
      const parentId = category.parentCategory?._id;

      if (!parentId) {
        return;
      }

      map.set(parentId, [...(map.get(parentId) ?? []), category]);
    });

    return map;
  }, [categories]);

  const selectedProject = projects.find((project) => project._id === selectedProjectId) ?? null;

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery = normalizedQuery
        ? getProjectTitle(project).toLowerCase().includes(normalizedQuery)
        : true;
      const matchesCategory = selectedCategoryId
        ? project.categories?.some((category) => category._id === selectedCategoryId)
        : true;

      return matchesQuery && matchesCategory;
    });
  }, [projects, query, selectedCategoryId]);

  const selectedItems = items.flatMap((item, index) => {
    const project = projects.find((entry) => entry._id === item.project?._ref);
    const image = project?.galleryImages?.find(
      (entry) => entry._key === item.selectedImageKey,
    );

    if (!project || !image?.asset?.url) {
      return [];
    }

    return [{ item, index, project, image }];
  });

  function updateItems(nextItems: CarouselItemValue[]) {
    onChange(set(nextItems));
  }

  function toggleCategory(categoryId: string) {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
    setSelectedCategoryId(categoryId);
  }

  function addImage(project: ProjectPreview, image: ProjectImage) {
    if (!image._key) {
      return;
    }

    const exists = items.some(
      (item) => item.project?._ref === project._id && item.selectedImageKey === image._key,
    );

    if (exists) {
      return;
    }

    updateItems([
      ...items,
      {
        _key: makeKey(),
        _type: "carouselItem",
        project: { _type: "reference", _ref: project._id },
        selectedImageKey: image._key,
        isVisible: true,
      },
    ]);
  }

  function removeItem(index: number) {
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function toggleVisible(index: number) {
    updateItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, isVisible: item.isVisible === false } : item,
      ),
    );
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return;
    }

    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    updateItems(nextItems);
  }

  return (
    <div style={shellStyle}>
      <section style={pickerStyle}>
        <aside style={treeStyle}>
          <div style={sectionHeadingStyle}>作品集來源</div>
          <button
            type="button"
            style={{ ...treeButtonStyle, ...(selectedCategoryId ? {} : activeTreeStyle) }}
            onClick={() => setSelectedCategoryId(null)}
          >
            全部作品集
          </button>

          {parentCategories.map((parent) => {
            const children = childrenByParent.get(parent._id) ?? [];
            const isExpanded = expandedCategoryIds.includes(parent._id);

            return (
              <div key={parent._id}>
                <button
                  type="button"
                  style={{
                    ...treeButtonStyle,
                    ...(selectedCategoryId === parent._id ? activeTreeStyle : {}),
                  }}
                  onClick={() => toggleCategory(parent._id)}
                >
                  <span>{isExpanded ? "▾" : "▸"}</span>
                  <span>📁 {parent.title || "未命名系列"}</span>
                </button>

                {isExpanded ? (
                  <div style={childTreeStyle}>
                    {children.map((child) => (
                      <button
                        key={child._id}
                        type="button"
                        style={{
                          ...treeButtonStyle,
                          ...(selectedCategoryId === child._id ? activeTreeStyle : {}),
                        }}
                        onClick={() => setSelectedCategoryId(child._id)}
                      >
                        <span>📂</span>
                        <span>{child.title || "未命名作品集分類"}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </aside>

        <div style={browserStyle}>
          <label style={searchLabelStyle}>
            搜尋作品集
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="輸入作品集名稱..."
              style={searchInputStyle}
            />
          </label>

          <div style={projectListStyle}>
            {filteredProjects.map((project) => (
              <button
                key={project._id}
                type="button"
                style={{
                  ...projectButtonStyle,
                  ...(selectedProjectId === project._id ? activeProjectStyle : {}),
                }}
                onClick={() => setSelectedProjectId(project._id)}
              >
                {project.coverImage?.asset?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.coverImage.asset.url} alt="" style={projectThumbStyle} />
                ) : (
                  <span style={projectThumbStyle} />
                )}
                <span>{getProjectTitle(project)}</span>
                <small>{project.galleryImages?.length ?? 0} 張</small>
              </button>
            ))}
          </div>

          <div style={imagePickerHeaderStyle}>
            <strong>{selectedProject ? getProjectTitle(selectedProject) : "請選擇作品集"}</strong>
            <span>{selectedProject?.galleryImages?.length ?? 0} 張照片</span>
          </div>

          <div style={imageGridStyle}>
            {(selectedProject?.galleryImages ?? []).map((image, index) => {
              const isSelected = items.some(
                (item) =>
                  item.project?._ref === selectedProjectId &&
                  item.selectedImageKey === image._key,
              );

              return (
                <button
                  key={image._key ?? index}
                  type="button"
                  style={{
                    ...imageButtonStyle,
                    ...(isSelected ? selectedImageStyle : {}),
                  }}
                  onClick={() => {
                    if (selectedProject) {
                      addImage(selectedProject, image);
                    }
                  }}
                >
                  {getImageUrl(image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(image)} alt="" style={imageStyle} />
                  ) : null}
                  <span>{isSelected ? "已加入" : "加入輪播"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={selectedSectionStyle}>
        <div style={selectedHeadingStyle}>
          <strong>首頁輪播順序</strong>
          <span>拖曳下方照片調整播放順序</span>
        </div>

        {selectedItems.length > 0 ? (
          <div style={selectedGridStyle}>
            {selectedItems.map(({ item, index, project, image }, visualIndex) => (
              <article
                key={item._key ?? `${project._id}-${image._key}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) {
                    moveItem(dragIndex, index);
                  }
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                style={selectedCardStyle}
              >
                <span style={dragHandleStyle}>⋮⋮</span>
                <span style={numberStyle}>{String(visualIndex + 1).padStart(2, "0")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(image)} alt="" style={selectedImagePreviewStyle} />
                <div style={selectedInfoStyle}>
                  <strong>{getProjectTitle(project)}</strong>
                  <span>{getImageLabel(image, visualIndex)}</span>
                </div>
                <button type="button" style={plainButtonStyle} onClick={() => toggleVisible(index)}>
                  {item.isVisible === false ? "顯示" : "隱藏"}
                </button>
                <button type="button" style={dangerButtonStyle} onClick={() => removeItem(index)}>
                  移除
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div style={emptyStyle}>請從上方作品集中挑選照片加入首頁輪播。</div>
        )}
      </section>
    </div>
  );
}

const shellStyle = {
  display: "grid",
  gap: 24,
};

const pickerStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  display: "grid",
  gap: 20,
  gridTemplateColumns: "280px minmax(0, 1fr)",
  padding: 18,
};

const treeStyle = {
  borderRight: "1px solid rgba(255,255,255,0.1)",
  paddingRight: 16,
};

const sectionHeadingStyle = {
  color: "#c9a46a",
  fontSize: 14,
  letterSpacing: "0.16em",
  marginBottom: 12,
};

const treeButtonStyle = {
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: 8,
  color: "rgba(244,240,232,0.72)",
  cursor: "pointer",
  display: "flex",
  gap: 8,
  font: "inherit",
  padding: "10px 12px",
  textAlign: "left" as const,
  width: "100%",
};

const activeTreeStyle = {
  background: "rgba(98,102,255,0.18)",
  color: "#f4f0e8",
};

const childTreeStyle = {
  borderLeft: "1px solid rgba(255,255,255,0.12)",
  marginLeft: 16,
  paddingLeft: 10,
};

const browserStyle = {
  minWidth: 0,
};

const searchLabelStyle = {
  color: "rgba(244,240,232,0.64)",
  display: "grid",
  gap: 8,
  fontSize: 14,
};

const searchInputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  color: "#f4f0e8",
  font: "inherit",
  padding: "12px 14px",
};

const projectListStyle = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  marginTop: 14,
};

const projectButtonStyle = {
  alignItems: "center",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f4f0e8",
  cursor: "pointer",
  display: "grid",
  gap: 10,
  gridTemplateColumns: "54px minmax(0, 1fr) auto",
  padding: 8,
  textAlign: "left" as const,
};

const activeProjectStyle = {
  borderColor: "#c9a46a",
  boxShadow: "0 0 0 1px rgba(201,164,106,0.45)",
};

const projectThumbStyle = {
  background: "#171717",
  borderRadius: 7,
  height: 44,
  objectFit: "cover" as const,
  width: 54,
};

const imagePickerHeaderStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  marginTop: 22,
};

const imageGridStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
  marginTop: 12,
};

const imageButtonStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#f4f0e8",
  cursor: "pointer",
  overflow: "hidden",
  padding: 0,
};

const selectedImageStyle = {
  borderColor: "#c9a46a",
};

const imageStyle = {
  aspectRatio: "4 / 3",
  background: "#111",
  display: "block",
  objectFit: "cover" as const,
  width: "100%",
};

const selectedSectionStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: 18,
};

const selectedHeadingStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 14,
};

const selectedGridStyle = {
  display: "grid",
  gap: 12,
};

const selectedCardStyle = {
  alignItems: "center",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  cursor: "grab",
  display: "grid",
  gap: 12,
  gridTemplateColumns: "28px 42px 96px minmax(0, 1fr) auto auto",
  padding: 10,
};

const dragHandleStyle = {
  color: "rgba(244,240,232,0.42)",
  letterSpacing: -2,
};

const numberStyle = {
  color: "#c9a46a",
  fontSize: 13,
  letterSpacing: "0.14em",
};

const selectedImagePreviewStyle = {
  background: "#111",
  borderRadius: 8,
  height: 64,
  objectFit: "cover" as const,
  width: 96,
};

const selectedInfoStyle = {
  display: "grid",
  gap: 4,
  minWidth: 0,
};

const plainButtonStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  color: "#f4f0e8",
  cursor: "pointer",
  padding: "8px 12px",
};

const dangerButtonStyle = {
  ...plainButtonStyle,
  border: "1px solid rgba(255,99,99,0.38)",
  color: "#ffb1b1",
};

const emptyStyle = {
  border: "1px dashed rgba(255,255,255,0.16)",
  borderRadius: 10,
  color: "rgba(244,240,232,0.58)",
  padding: 22,
  textAlign: "center" as const,
};
