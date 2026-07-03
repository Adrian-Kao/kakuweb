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
        <div style={sectionHeaderStyle}>
          <strong>首頁輪播</strong>
          <span>可拖曳調整順序</span>
        </div>

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
                <span style={carouselNumberStyle}>
                  {String(visualIndex + 1).padStart(2, "0")}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(image)} alt="" style={carouselImageStyle} />

                <div style={carouselMetaStyle}>
                  <strong>{getProjectTitle(project)}</strong>
                  <span>{getImageLabel(image, visualIndex)}</span>
                </div>

                <div style={carouselActionsStyle}>
                  <button
                    type="button"
                    style={ghostButtonStyle}
                    onClick={() => toggleVisible(index)}
                  >
                    {item.isVisible === false ? "顯示" : "隱藏"}
                  </button>

                  <button
                    type="button"
                    style={removeButtonStyle}
                    onClick={() => removeItem(index)}
                  >
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
          <div style={panelTitleStyle}>分類 / 作品集</div>

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
                          <span>{expandedCategoryIds.includes(child._id) ? "▾" : "▸"}</span>
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

          <div style={projectSectionTitleStyle}>作品集</div>

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

                <span style={projectTitleTextStyle}>{getProjectTitle(project)}</span>
                <small style={projectCountStyle}>{project.galleryImages?.length ?? 0} 張</small>
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

                  <span style={{ ...imageCaptionStyle, ...(isSelected ? selectedCaptionStyle : {}) }}>
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
  boxSizing: "border-box",
  display: "grid",
  gap: 28,

  // 吃回 Sanity 左側 label 欄位空間
  marginLeft: -260,
  width: "calc(100% + 260px)",
  maxWidth: "calc(100% + 260px)",

  // 防止右側超出
  overflowX: "hidden",
  paddingBottom: 12,
};

const sectionHeaderStyle: CSSProperties = {
  alignItems: "baseline",
  color: "#f4f0e8",
  display: "flex",
  gap: 10,
  letterSpacing: "0.04em",
  marginBottom: 14,
};

const carouselSectionStyle: CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  boxSizing: "border-box",
  maxWidth: "100%",
  overflowX: "hidden",
  paddingBottom: 26,
  width: "100%",
};

const carouselTrackStyle: CSSProperties = {
  boxSizing: "border-box",
  display: "grid",
  gap: 18,
  gridAutoColumns: "minmax(210px, 250px)",
  gridAutoFlow: "column",
  maxWidth: "100%",
  overflowX: "auto",
  padding: "4px 2px 18px",
  scrollbarColor: "rgba(201,164,106,0.72) rgba(255,255,255,0.08)",
  width: "100%",
};

const carouselCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 10,
  boxSizing: "border-box",
  cursor: "grab",
  minWidth: 0,
  overflow: "hidden",
  position: "relative",
  width: "100%",
};

const carouselNumberStyle: CSSProperties = {
  background: "#c9a46a",
  borderRadius: "0 0 10px 0",
  color: "#1c140c",
  fontSize: 14,
  fontWeight: 700,
  left: 12,
  letterSpacing: "0.12em",
  padding: "8px 12px",
  position: "absolute",
  top: 0,
  zIndex: 1,
};

const carouselImageStyle: CSSProperties = {
  display: "block",
  height: "auto",
  width: "100%",
};

const carouselMetaStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
  padding: "12px 12px 0",
};

const carouselActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
  padding: "10px 12px 12px",
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
  boxSizing: "border-box",
  display: "grid",
  gap: 20,
  gridTemplateColumns: "minmax(240px, 300px) minmax(0, 1fr)",
  maxWidth: "100%",
  overflowX: "hidden",
  width: "100%",
};

const treeStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  boxSizing: "border-box",
  minHeight: 520,
  minWidth: 0,
  overflowX: "hidden",
  padding: 18,
  width: "100%",
};

const panelTitleStyle: CSSProperties = {
  color: "#f4f0e8",
  fontSize: 14,
  letterSpacing: "0.04em",
  marginBottom: 20,
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
  minWidth: 0,
  padding: "11px 12px",
  textAlign: "left",
  width: "100%",
};

const activeTreeStyle: CSSProperties = {
  background: "rgba(90,96,190,0.34)",
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
  minWidth: 0,
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
  overflowX: "hidden",
  width: "100%",
};

const browserTopStyle: CSSProperties = {
  alignItems: "end",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 18,
  maxWidth: "100%",
  minWidth: 0,
  paddingBottom: 14,
  width: "100%",
};

const searchLabelStyle: CSSProperties = {
  color: "rgba(244,240,232,0.64)",
  display: "grid",
  flex: "0 1 420px",
  gap: 8,
  fontSize: 14,
  minWidth: 0,
};

const searchInputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 10,
  boxSizing: "border-box",
  color: "#f4f0e8",
  font: "inherit",
  padding: "12px 14px",
  width: "100%",
};

const projectSectionTitleStyle: CSSProperties = {
  color: "rgba(244,240,232,0.72)",
  fontSize: 14,
  marginBottom: 12,
};

const projectListStyle: CSSProperties = {
  boxSizing: "border-box",
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  maxWidth: "100%",
  width: "100%",
};

const projectButtonStyle: CSSProperties = {
  alignItems: "stretch",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  boxSizing: "border-box",
  color: "#f4f0e8",
  cursor: "pointer",
  display: "grid",
  gap: 0,
  gridTemplateColumns: "1fr",
  minWidth: 0,
  overflow: "hidden",
  padding: 0,
  textAlign: "left",
  width: "100%",
};

const activeProjectStyle: CSSProperties = {
  borderColor: "#c9a46a",
  boxShadow: "0 0 0 1px rgba(201,164,106,0.45)",
};

const projectThumbStyle: CSSProperties = {
  background: "#171717",
  display: "block",
  height: "auto",
  objectFit: "cover",
  width: "100%",
};

const projectTitleTextStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  padding: "10px 12px 2px",
  textOverflow: "ellipsis",
};

const projectCountStyle: CSSProperties = {
  color: "rgba(244,240,232,0.62)",
  padding: "0 12px 12px",
  whiteSpace: "nowrap",
};

const imagePickerHeaderStyle: CSSProperties = {
  alignItems: "center",
  boxSizing: "border-box",
  display: "flex",
  gap: 16,
  justifyContent: "space-between",
  marginTop: 28,
  maxWidth: "100%",
  minWidth: 0,
  width: "100%",
};

const imageGridStyle: CSSProperties = {
  boxSizing: "border-box",
  columnCount: 3,
  columnGap: 18,
  marginTop: 14,
  maxWidth: "100%",
  overflowX: "hidden",
  width: "100%",
};

const imageButtonStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  boxSizing: "border-box",
  breakInside: "avoid",
  color: "#f4f0e8",
  cursor: "pointer",
  display: "block",
  marginBottom: 18,
  minWidth: 0,
  overflow: "hidden",
  padding: 0,
  textAlign: "left",
  width: "100%",
};

const selectedImageStyle: CSSProperties = {
  borderColor: "#c9a46a",
  boxShadow: "0 0 0 1px rgba(201,164,106,0.5)",
};

const imageStyle: CSSProperties = {
  display: "block",
  height: "auto",
  width: "100%",
};

const imageCaptionStyle: CSSProperties = {
  alignItems: "center",
  background: "rgba(255,255,255,0.045)",
  boxSizing: "border-box",
  display: "flex",
  fontSize: 13,
  height: 34,
  overflow: "hidden",
  padding: "0 10px",
  whiteSpace: "nowrap",
  width: "100%",
};

const selectedCaptionStyle: CSSProperties = {
  color: "#c9a46a",
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
