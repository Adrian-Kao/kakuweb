"use client";

import type { CSSProperties } from "react";
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

  const projectsByCategory = useMemo(() => {
    const map = new Map<string, ProjectPreview[]>();

    projects.forEach((project) => {
      project.categories?.forEach((category) => {
        if (!category?._id) {
          return;
        }

        map.set(category._id, [...(map.get(category._id) ?? []), project]);
      });
    });

    return map;
  }, [projects]);

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


      <section style={carouselSectionStyle}>
        {selectedItems.length > 0 ? (
          <div style={carouselTrackStyle}>
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
                style={carouselCardStyle}
                title="拖曳調整順序"
              >
                <span style={carouselNumberStyle}>{String(visualIndex + 1).padStart(2, "0")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(image)} alt="" style={carouselImageStyle} />
                <div style={carouselMetaStyle}>
                  <strong>{getProjectTitle(project)}</strong>
                  <span>{getImageLabel(image, visualIndex)}</span>
                </div>
                <div style={carouselActionsStyle}>
                  <button type="button" style={ghostButtonStyle} onClick={() => toggleVisible(index)}>
                    {item.isVisible === false ? "顯示" : "隱藏"}
                  </button>
                  <button type="button" style={removeButtonStyle} onClick={() => removeItem(index)}>
                    移除
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={emptyCarouselStyle}>從下方作品集中挑選照片加入首頁輪播。</div>
        )}
      </section>

      <section style={pickerStyle}>
        <aside style={treeStyle}>
          <button
            type="button"
            style={{ ...treeButtonStyle, ...(selectedCategoryId ? {} : activeTreeStyle) }}
            onClick={() => setSelectedCategoryId(null)}
          >
            全部作品集
          </button>

          {parentCategories.map((parent) => {
            const children = childrenByParent.get(parent._id) ?? [];
            const parentProjects = projectsByCategory.get(parent._id) ?? [];
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
                  <span>{parent.title || "未命名系列"}</span>
                </button>

                {isExpanded ? (
                  <div style={childTreeStyle}>
                    {parentProjects.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        style={{
                          ...projectTreeButtonStyle,
                          ...(selectedProjectId === project._id ? activeProjectTreeStyle : {}),
                        }}
                        onClick={() => {
                          setSelectedCategoryId(parent._id);
                          setSelectedProjectId(project._id);
                        }}
                      >
                        <span style={projectDotStyle} />
                        <span>{getProjectTitle(project)}</span>
                      </button>
                    ))}

                    {children.map((child) => (
                      <div key={child._id}>
                        <button
                          type="button"
                          style={{
                            ...treeButtonStyle,
                            ...(selectedCategoryId === child._id ? activeTreeStyle : {}),
                          }}
                          onClick={() => toggleCategory(child._id)}
                        >
                          <span>
                            {expandedCategoryIds.includes(child._id) ? "▾" : "▸"}
                          </span>
                          <span>{child.title || "未命名作品集分類"}</span>
                        </button>

                        {expandedCategoryIds.includes(child._id) ? (
                          <div style={nestedTreeStyle}>
                            {(projectsByCategory.get(child._id) ?? []).map((project) => (
                              <button
                                key={project._id}
                                type="button"
                                style={{
                                  ...projectTreeButtonStyle,
                                  ...(selectedProjectId === project._id
                                    ? activeProjectTreeStyle
                                    : {}),
                                }}
                                onClick={() => {
                                  setSelectedCategoryId(child._id);
                                  setSelectedProjectId(project._id);
                                }}
                              >
                                <span style={projectDotStyle} />
                                <span>{getProjectTitle(project)}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </aside>

        <div style={browserStyle}>
          <div style={browserTopStyle}>
            <label style={searchLabelStyle}>
              <span>搜尋作品集</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="輸入作品集名稱..."
                style={searchInputStyle}
              />
            </label>
          </div>

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
                  <span style={imageCaptionStyle}>
                    {isSelected ? "已加入輪播" : "加入輪播"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: "grid",
  gap: 28,
  marginLeft: "calc((100vw - 460px - 100%) / -2)",
  paddingBottom: 12,
  width: "min(1320px, calc(100vw - 460px))",
};

const carouselSectionStyle: CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  paddingBottom: 26,
};

const carouselTrackStyle: CSSProperties = {
  display: "grid",
  gap: 18,
  gridAutoColumns: "minmax(190px, 230px)",
  gridAutoFlow: "column",
  overflowX: "auto",
  padding: "4px 2px 18px",
  scrollbarColor: "rgba(201,164,106,0.72) rgba(255,255,255,0.08)",
};

const carouselCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 18,
  cursor: "grab",
  overflow: "hidden",
  position: "relative",
};

const carouselNumberStyle: CSSProperties = {
  background: "rgba(5,5,5,0.62)",
  borderRadius: 999,
  color: "#c9a46a",
  fontSize: 12,
  left: 12,
  letterSpacing: "0.12em",
  padding: "5px 8px",
  position: "absolute",
  top: 12,
  zIndex: 1,
};

const carouselImageStyle: CSSProperties = {
  aspectRatio: "4 / 3",
  background: "#111",
  display: "block",
  objectFit: "cover",
  width: "100%",
};

const carouselMetaStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "12px 12px 0",
};

const carouselActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  padding: 12,
};

const emptyCarouselStyle: CSSProperties = {
  alignItems: "center",
  border: "1px dashed rgba(255,255,255,0.16)",
  borderRadius: 18,
  color: "rgba(244,240,232,0.58)",
  display: "flex",
  minHeight: 160,
  padding: 24,
};

const pickerStyle: CSSProperties = {
  display: "grid",
  gap: 36,
  gridTemplateColumns: "340px minmax(0, 1fr)",
};

const treeStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  minHeight: 520,
  padding: 18,
};

const treeButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: 10,
  color: "rgba(244,240,232,0.72)",
  cursor: "pointer",
  display: "flex",
  gap: 10,
  font: "inherit",
  padding: "11px 12px",
  textAlign: "left",
  width: "100%",
};

const activeTreeStyle: CSSProperties = {
  background: "rgba(98,102,255,0.18)",
  color: "#f4f0e8",
};

const childTreeStyle: CSSProperties = {
  borderLeft: "1px solid rgba(255,255,255,0.12)",
  marginLeft: 18,
  paddingLeft: 12,
};

const nestedTreeStyle: CSSProperties = {
  borderLeft: "1px solid rgba(255,255,255,0.1)",
  marginLeft: 18,
  paddingLeft: 12,
};

const projectTreeButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: 9,
  color: "rgba(244,240,232,0.58)",
  cursor: "pointer",
  display: "flex",
  gap: 10,
  font: "inherit",
  padding: "9px 12px",
  textAlign: "left",
  width: "100%",
};

const activeProjectTreeStyle: CSSProperties = {
  background: "rgba(201,164,106,0.12)",
  color: "#f4f0e8",
};

const projectDotStyle: CSSProperties = {
  border: "1px solid rgba(201,164,106,0.74)",
  borderRadius: 3,
  display: "block",
  flex: "0 0 auto",
  height: 11,
  width: 11,
};

const browserStyle: CSSProperties = {
  boxSizing: "border-box",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
};

const browserTopStyle: CSSProperties = {
  alignItems: "end",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 14,
};

const searchLabelStyle: CSSProperties = {
  color: "rgba(244,240,232,0.64)",
  display: "grid",
  flex: "0 1 420px",
  gap: 8,
  fontSize: 14,
};

const searchInputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 10,
  color: "#f4f0e8",
  font: "inherit",
  padding: "12px 14px",
};

const projectListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
};

const projectButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#f4f0e8",
  cursor: "pointer",
  display: "grid",
  gap: 10,
  gridTemplateColumns: "54px minmax(0, 1fr) auto",
  padding: 8,
  textAlign: "left",
};

const activeProjectStyle: CSSProperties = {
  borderColor: "#c9a46a",
  boxShadow: "0 0 0 1px rgba(201,164,106,0.45)",
};

const projectThumbStyle: CSSProperties = {
  background: "#171717",
  borderRadius: 8,
  height: 44,
  objectFit: "cover",
  width: 54,
};

const imagePickerHeaderStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  marginTop: 28,
};

const imageGridStyle: CSSProperties = {
  boxSizing: "border-box",
  display: "grid",
  gap: 12,
  gridAutoRows: 176,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  justifyContent: "start",
  marginTop: 14,
  maxHeight: "calc(100vh - 430px)",
  minHeight: 360,
  overflowX: "hidden",
  overflowY: "auto",
  paddingRight: 10,
  width: "100%",
};

const imageButtonStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  color: "#f4f0e8",
  cursor: "pointer",
  display: "grid",
  gridTemplateRows: "1fr 34px",
  height: 176,
  overflow: "hidden",
  padding: 0,
  textAlign: "left",
  width: "100%",
};

const selectedImageStyle: CSSProperties = {
  borderColor: "#c9a46a",
};

const imageStyle: CSSProperties = {
  background: "#111",
  display: "block",
  height: "100%",
  minHeight: 0,
  objectFit: "cover",
  width: "100%",
};

const imageCaptionStyle: CSSProperties = {
  alignItems: "center",
  background: "rgba(5,5,5,0.42)",
  display: "flex",
  fontSize: 13,
  height: 34,
  overflow: "hidden",
  padding: "0 10px",
  whiteSpace: "nowrap",
};

const ghostButtonStyle: CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  color: "#f4f0e8",
  cursor: "pointer",
  padding: "7px 10px",
};

const removeButtonStyle: CSSProperties = {
  ...ghostButtonStyle,
  border: "1px solid rgba(255,99,99,0.38)",
  color: "#ffb1b1",
};
