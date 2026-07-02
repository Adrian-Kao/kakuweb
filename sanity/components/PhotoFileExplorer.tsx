"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "sanity";

type CategoryDoc = {
  _id: string;
  title?: string | null;
  slug?: string;
  order?: number;
  isVisible?: boolean;
  parentCategory?: {
    _id: string;
    title: string;
    slug?: string;
  };
};

type ProjectImageDoc = {
  _key?: string;
  caption?: string;
  isCover?: boolean;
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
  };
};

type ProjectDoc = {
  _id: string;
  title?: string | null;
  slug?: string;
  shootingDate?: string;
  coverImage?: ProjectImageDoc;
  galleryImages?: ProjectImageDoc[];
  categories?: CategoryDoc[];
};

const apiVersion = "2025-01-01";

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function slugify(input: string) {
  const trimmed = input.trim().toLowerCase();
  const asciiSlug = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return asciiSlug || encodeURIComponent(trimmed).replace(/%/g, "").toLowerCase();
}

function imageUrl(image?: ProjectImageDoc) {
  const asset = image?.asset;
  return asset?.url ?? asset?._ref ?? asset?._id ?? "";
}

function categoryTitle(category?: CategoryDoc | null) {
  return category?.title?.trim() || "未命名系列";
}

function projectTitle(project?: ProjectDoc | null) {
  return project?.title?.trim() || "未命名作品集";
}

export default function PhotoFileExplorer() {
  const client = useClient({ apiVersion });
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedCategory = categories.find((item) => item._id === selectedCategoryId) ?? null;
  const selectedProject = projects.find((item) => item._id === selectedProjectId) ?? null;

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const [categoryDocs, projectDocs] = await Promise.all([
        client.fetch<CategoryDoc[]>(
          `*[_type == "category"] | order(order asc, title asc) {
            _id,
            title,
            "slug": slug.current,
            order,
            isVisible,
            parentCategory->{ _id, title, "slug": slug.current }
          }`,
        ),
        client.fetch<ProjectDoc[]>(
          `*[_type == "project"] | order(shootingDate desc, _updatedAt desc) {
            _id,
            title,
            "slug": slug.current,
            shootingDate,
            coverImage{..., asset->{_id, url}},
            galleryImages[]{..., asset->{_id, url}},
            categories[]->{ _id, title, "slug": slug.current }
          }`,
        ),
      ]);

      setCategories(categoryDocs);
      setProjects(projectDocs);
      setSelectedCategoryId((current) => current ?? categoryDocs[0]?._id ?? null);
      setExpandedCategoryIds((current) =>
        current.length > 0 ? current : categoryDocs.slice(0, 4).map((category) => category._id),
      );
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  useEffect(() => {
    folderInputRef.current?.setAttribute("webkitdirectory", "");
    folderInputRef.current?.setAttribute("directory", "");
  }, []);

  const categoryTree = useMemo(() => {
    const parents = categories.filter((item) => !item.parentCategory);
    const childrenByParent = new Map<string, CategoryDoc[]>();

    categories.forEach((category) => {
      const parentId = category.parentCategory?._id;

      if (!parentId) {
        return;
      }

      childrenByParent.set(parentId, [
        ...(childrenByParent.get(parentId) ?? []),
        category,
      ]);
    });

    return parents.map((parent) => ({
      parent,
      children: childrenByParent.get(parent._id) ?? [],
    }));
  }, [categories]);

  const visibleProjects = useMemo(() => {
    if (!selectedCategoryId) {
      return projects;
    }

    return projects.filter((project) =>
      project.categories?.some((category) => category._id === selectedCategoryId),
    );
  }, [projects, selectedCategoryId]);

  const projectsByCategory = useMemo(() => {
    const map = new Map<string, ProjectDoc[]>();

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

  function toggleCategory(categoryId: string) {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  async function createCategory(parentId?: string) {
    const label = parentId ? "請輸入作品集名稱" : "請輸入作品分類名稱";
    const title = window.prompt(label);

    if (!title?.trim()) {
      return;
    }

    const order = categories.length + 1;

    await client.create({
      _type: "category",
      title: title.trim(),
      slug: { _type: "slug", current: slugify(title) },
      parentCategory: parentId
        ? { _type: "reference", _ref: parentId }
        : undefined,
      order,
      isVisible: true,
    });

    setMessage("分類已新增");
    await loadData();
  }

  async function renameCategory(category: CategoryDoc) {
    const title = window.prompt("修改系列名稱", categoryTitle(category));

    if (!title?.trim()) {
      return;
    }

    await client.patch(category._id).set({ title: title.trim() }).commit();
    setMessage("分類已重新命名");
    await loadData();
  }

  async function deleteCategory(category: CategoryDoc) {
    const childCategories = categories.filter(
      (item) => item.parentCategory?._id === category._id,
    );
    const categoryIds = [category._id, ...childCategories.map((item) => item._id)];
    const affectedProjects = projects.filter((project) =>
      project.categories?.some((item) => item?._id && categoryIds.includes(item._id)),
    );
    const confirmed = window.confirm(
      `確定刪除「${categoryTitle(category)}」？\n\n` +
        `會一併刪除 ${childCategories.length} 個子分類，並從 ${affectedProjects.length} 個作品集中移除這個分類。\n` +
        "作品集與照片不會被刪除。",
    );

    if (!confirmed) {
      return;
    }

    await Promise.all(
      affectedProjects.map((project) => {
        const categoriesToKeep =
          project.categories
            ?.filter((item) => item?._id && !categoryIds.includes(item._id))
            .map((item) => ({
              _type: "reference",
              _key: makeKey(),
              _ref: item._id,
            })) ?? [];

        return client.patch(project._id).set({ categories: categoriesToKeep }).commit();
      }),
    );

    for (const child of childCategories) {
      await client.delete(child._id);
    }

    await client.delete(category._id);
    setSelectedCategoryId(null);
    setSelectedProjectId(null);
    setExpandedCategoryIds((current) => current.filter((id) => !categoryIds.includes(id)));
    setMessage("系列已刪除，相關作品集已解除分類");
    await loadData();
    return;
    const ok = window.confirm(`確定刪除「${category.title}」？作品不會被刪除。`);

    if (!ok) {
      return;
    }

    await client.delete(category._id);
    setSelectedCategoryId(null);
    setMessage("分類已刪除");
    await loadData();
  }

  async function createProject() {
    const title = window.prompt(
      selectedCategory
        ? `在「${selectedCategory.title}」建立新作品集，請輸入作品名稱`
        : "請輸入新作品集名稱",
    );

    if (!title?.trim()) {
      return;
    }

    const project = await client.create({
      _type: "project",
      title: title.trim(),
      slug: { _type: "slug", current: slugify(title) },
      categories: selectedCategoryId
        ? [{ _type: "reference", _key: makeKey(), _ref: selectedCategoryId }]
        : [],
      galleryImages: [],
    });

    setSelectedProjectId(project._id);
    setMessage("作品集已建立，可以開始上傳照片");
    await loadData();
  }

  async function moveProject(projectId: string, categoryId: string) {
    await client
      .patch(projectId)
      .set({
        categories: [{ _type: "reference", _key: makeKey(), _ref: categoryId }],
      })
      .commit();

    setMessage("作品集已移動到新的分類");
    await loadData();
  }

  async function deleteProject(project: ProjectDoc) {
    const ok = window.confirm(
      `確定刪除作品集「${projectTitle(project)}」？\n\n` +
        `這個作品集內有 ${project.galleryImages?.length ?? 0} 張照片。刪除後，首頁輪播中引用這個作品集的項目也會一併移除。`,
    );

    if (!ok) {
      return;
    }

    const carousel = await client.fetch<{
      _id?: string;
      carouselItems?: { _key?: string; project?: { _ref?: string } }[];
    }>(
      `*[_type == "homepageCarousel" && _id == "homepageCarousel"][0] {
        _id,
        carouselItems[]{ _key, project }
      }`,
    );
    const remainingCarouselItems =
      carousel?.carouselItems?.filter((item) => item.project?._ref !== project._id) ?? [];

    if (carousel?._id && remainingCarouselItems.length !== carousel.carouselItems?.length) {
      await client
        .patch(carousel._id)
        .set({ carouselItems: remainingCarouselItems })
        .commit();
    }

    await client.delete(project._id);

    if (selectedProjectId === project._id) {
      setSelectedProjectId(null);
    }

    setMessage("作品集已刪除，首頁輪播引用已同步移除");
    await loadData();
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!selectedProject || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setMessage("照片上傳中...");

    try {
      const images = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const asset = await client.assets.upload("image", file, {
          filename: file.name,
        });

        images.push({
          _type: "projectImage",
          _key: makeKey(),
          asset: { _type: "reference", _ref: asset._id },
          caption: file.name,
        });
      }

      if (images.length > 0) {
        await client
          .patch(selectedProject._id)
          .setIfMissing({ galleryImages: [] })
          .append("galleryImages", images)
          .commit();
      }

      setMessage(`已上傳 ${images.length} 張照片`);
      await loadData();
    } finally {
      setIsUploading(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function setCover(project: ProjectDoc, image: ProjectImageDoc) {
    const assetId = image.asset?._id ?? image.asset?._ref;

    if (!assetId) {
      return;
    }

    await client
      .patch(project._id)
      .set({
        coverImage: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      })
      .commit();

    setMessage("封面已更新");
    await loadData();
  }

  const currentPath = selectedCategory
    ? selectedCategory.parentCategory
      ? `作品照片 / ${selectedCategory.parentCategory.title} / ${selectedCategory.title}`
      : `作品照片 / ${selectedCategory.title}`
    : "作品照片";

  return (
    <div className="kaku-file-explorer">
      <aside className="kaku-sidebar">
        <div className="kaku-brand">
          <div className="kaku-logo">KAKU</div>
          <div>
            <strong>KAKU 攝影作品後台</strong>
            <span>檔案總覽</span>
          </div>
        </div>

        <button
          className={`kaku-root ${!selectedCategoryId ? "active" : ""}`}
          type="button"
          onClick={() => setSelectedCategoryId(null)}
        >
          作品照片
        </button>

        <div className="kaku-folder-actions">
          <button type="button" onClick={() => createCategory()}>
            + 作品分類
          </button>
          <button
            type="button"
            disabled={!selectedCategoryId}
            onClick={createProject}
          >
            + 作品集
          </button>
        </div>

        <div className="kaku-tree">
          {categoryTree.map(({ parent, children }) => {
            const isParentExpanded = expandedCategoryIds.includes(parent._id);
            const parentProjects = projectsByCategory.get(parent._id) ?? [];

            return (
              <div key={parent._id} className="kaku-tree-group">
                <CategoryTreeButton
                  category={parent}
                  isActive={selectedCategoryId === parent._id}
                  isExpanded={isParentExpanded}
                  projectCount={parentProjects.length + children.length}
                  onSelect={setSelectedCategoryId}
                  onToggle={toggleCategory}
                  onRename={renameCategory}
                  onDelete={deleteCategory}
                />

                {isParentExpanded ? (
                  <div className="kaku-tree-children">
                    {parentProjects.map((project) => (
                      <ProjectTreeItem
                        key={project._id}
                        project={project}
                        isActive={selectedProjectId === project._id}
                        onSelect={(projectId) => {
                          setSelectedCategoryId(parent._id);
                          setSelectedProjectId(projectId);
                        }}
                      />
                    ))}

                    {children.map((child) => {
                      const isChildExpanded = expandedCategoryIds.includes(child._id);
                      const childProjects = projectsByCategory.get(child._id) ?? [];

                      return (
                        <div key={child._id}>
                          <CategoryTreeButton
                            category={child}
                            isActive={selectedCategoryId === child._id}
                            isExpanded={isChildExpanded}
                            isChild
                            projectCount={childProjects.length}
                            onSelect={setSelectedCategoryId}
                            onToggle={toggleCategory}
                            onRename={renameCategory}
                            onDelete={deleteCategory}
                          />

                          {isChildExpanded ? (
                            <div className="kaku-tree-children nested">
                              {childProjects.map((project) => (
                                <ProjectTreeItem
                                  key={project._id}
                                  project={project}
                                  isActive={selectedProjectId === project._id}
                                  onSelect={(projectId) => {
                                    setSelectedCategoryId(child._id);
                                    setSelectedProjectId(projectId);
                                  }}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="kaku-main">
        <header className="kaku-header">
          <div>
            <p>{currentPath}</p>
            <h1>{selectedCategory?.title ?? "全部作品"}</h1>
            <span>
              {visibleProjects.length} 個作品集
              {message ? ` · ${message}` : ""}
            </span>
          </div>
          <div className="kaku-toolbar">
            <button type="button" onClick={() => loadData()}>
              重新整理
            </button>
            <button type="button" onClick={createProject}>
              + 新增作品集
            </button>
          </div>
        </header>

        <section className="kaku-project-grid">
          {isLoading ? (
            <div className="kaku-empty">讀取作品中...</div>
          ) : visibleProjects.length === 0 ? (
            <div className="kaku-empty">這個分類還沒有作品集。</div>
          ) : (
            visibleProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                categories={categories}
                isActive={selectedProjectId === project._id}
                onSelect={setSelectedProjectId}
                onMove={moveProject}
                onDelete={deleteProject}
              />
            ))
          )}
        </section>

        <section
          className="kaku-photo-panel"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            uploadFiles(event.dataTransfer.files);
          }}
        >
          {selectedProject ? (
            <>
              <div className="kaku-photo-heading">
                <div>
                  <button
                    type="button"
                    className="kaku-back"
                    onClick={() => setSelectedProjectId(null)}
                  >
                    ←
                  </button>
                  <strong>{selectedProject.title}</strong>
                  <span>{selectedProject.galleryImages?.length ?? 0} 張照片</span>
                </div>
                <div className="kaku-toolbar">
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

              <div className="kaku-photo-grid">
                {(selectedProject.galleryImages ?? []).map((image, index) => (
                  <button
                    key={image._key ?? index}
                    type="button"
                    className="kaku-photo-card"
                    onClick={() => setCover(selectedProject, image)}
                  >
                    {imageUrl(image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl(image)} alt={image.caption ?? ""} />
                    ) : (
                      <div className="kaku-image-missing">No image</div>
                    )}
                    <span>{image.caption || `photo-${index + 1}`}</span>
                    <em>點擊設為封面</em>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="kaku-empty">
              點選上方作品集後，這裡會顯示作品集內的照片縮圖。
            </div>
          )}
        </section>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => event.target.files && uploadFiles(event.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => event.target.files && uploadFiles(event.target.files)}
      />

      <style>{`
        .kaku-file-explorer {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          min-height: 100vh;
          background: #0d0f15;
          color: #f4f0e8;
          font-size: 16px;
        }

        .kaku-sidebar {
          border-right: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(180deg, #11141d, #090b10);
          padding: 18px;
        }

        .kaku-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }

        .kaku-logo {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 8px;
          background: #2c2f39;
          font-size: 12px;
        }

        .kaku-brand strong,
        .kaku-brand span {
          display: block;
        }

        .kaku-brand span {
          margin-top: 4px;
          color: rgba(244,240,232,0.56);
          font-size: 13px;
        }

        .kaku-root,
        .kaku-category {
          width: 100%;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: rgba(244,240,232,0.78);
          cursor: pointer;
          font: inherit;
          text-align: left;
        }

        .kaku-root {
          padding: 12px;
          font-weight: 700;
        }

        .kaku-root.active,
        .kaku-category.active {
          background: rgba(100,105,255,0.18);
          color: #f4f0e8;
        }

        .kaku-folder-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 16px 0 20px;
        }

        .kaku-folder-actions button,
        .kaku-toolbar button,
        .kaku-back {
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          color: #f4f0e8;
          cursor: pointer;
          padding: 10px 12px;
        }

        .kaku-folder-actions button:disabled,
        .kaku-toolbar button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .kaku-tree-group {
          margin-bottom: 10px;
        }

        .kaku-tree-children {
          border-left: 1px solid rgba(255,255,255,0.13);
          margin-left: 18px;
          padding-left: 10px;
        }

        .kaku-tree-children.nested {
          margin-left: 34px;
        }

        .kaku-category {
          align-items: center;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 6px;
          margin: 3px 0;
          padding: 8px;
        }

        .kaku-category > button:first-child {
          align-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: grid;
          grid-template-columns: 18px 18px minmax(0, 1fr) auto;
          gap: 6px;
          font: inherit;
          min-width: 0;
          overflow: hidden;
          padding: 8px 6px;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .kaku-tree-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .kaku-tree-chevron,
        .kaku-tree-icon {
          color: rgba(244,240,232,0.72);
          text-align: center;
        }

        .kaku-project-tree-item {
          align-items: center;
          background: transparent;
          border: 0;
          border-radius: 7px;
          color: rgba(244,240,232,0.7);
          cursor: pointer;
          display: grid;
          font: inherit;
          grid-template-columns: 18px 14px minmax(0, 1fr) auto;
          gap: 8px;
          margin: 3px 0 3px 20px;
          padding: 8px 8px;
          text-align: left;
          width: calc(100% - 20px);
        }

        .kaku-project-tree-item:hover,
        .kaku-project-tree-item.active {
          background: rgba(100,105,255,0.14);
          color: #f4f0e8;
        }

        .kaku-project-dot {
          border: 1px solid rgba(201,164,106,0.76);
          border-radius: 3px;
          display: block;
          height: 12px;
          width: 12px;
        }

        .kaku-project-tree-item small,
        .kaku-category > button:first-child small {
          color: rgba(244,240,232,0.42);
          font-size: 12px;
        }

        .kaku-category.child {
          margin-left: 20px;
        }

        .kaku-category small {
          color: rgba(244,240,232,0.42);
          font-size: 12px;
        }

        .kaku-category-actions {
          display: flex;
          gap: 8px;
        }

        .kaku-category-actions button {
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          color: rgba(244,240,232,0.82);
          cursor: pointer;
          font-size: 14px;
          min-width: 52px;
          padding: 8px 10px;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
        }

        .kaku-category-actions button:hover {
          background: rgba(201,164,106,0.16);
          border-color: rgba(201,164,106,0.55);
          color: #f4f0e8;
        }

        .kaku-category-actions button.danger {
          border-color: rgba(255,99,99,0.28);
          color: #ff9b9b;
        }

        .kaku-category-actions button.danger:hover {
          background: rgba(255,77,77,0.14);
          border-color: rgba(255,99,99,0.64);
          color: #ffd6d6;
        }

        .kaku-main {
          min-width: 0;
          padding: 24px 28px 36px;
        }

        .kaku-header,
        .kaku-photo-heading {
          align-items: center;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .kaku-header p {
          color: rgba(244,240,232,0.54);
          margin: 0 0 8px;
        }

        .kaku-header h1 {
          font-size: 32px;
          margin: 0 0 6px;
        }

        .kaku-header span,
        .kaku-photo-heading span {
          color: rgba(244,240,232,0.56);
        }

        .kaku-toolbar {
          display: flex;
          gap: 10px;
        }

        .kaku-toolbar button:last-child {
          background: #6266ff;
          border-color: #6266ff;
        }

        .kaku-project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          min-height: 290px;
        }

        .kaku-project-card {
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          background: rgba(255,255,255,0.045);
          color: #f4f0e8;
          cursor: pointer;
          overflow: hidden;
          padding: 0;
          text-align: left;
        }

        .kaku-project-card.active {
          border-color: #6266ff;
          box-shadow: 0 0 0 1px #6266ff;
        }

        .kaku-cover {
          aspect-ratio: 4 / 3;
          background: #181818;
          overflow: hidden;
        }

        .kaku-cover img,
        .kaku-photo-card img {
          display: block;
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .kaku-project-info {
          padding: 14px;
        }

        .kaku-project-info strong {
          display: block;
          font-size: 17px;
          margin-bottom: 8px;
        }

        .kaku-project-info p,
        .kaku-project-info span {
          color: rgba(244,240,232,0.58);
          display: block;
          margin: 6px 0 0;
        }

        .kaku-project-info select {
          background: #11141d;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 7px;
          color: #f4f0e8;
          margin-top: 12px;
          padding: 8px;
          width: 100%;
        }

        .kaku-delete-project {
          background: rgba(255,77,77,0.1);
          border: 1px solid rgba(255,99,99,0.42);
          border-radius: 8px;
          color: #ffb1b1;
          cursor: pointer;
          font: inherit;
          margin-top: 10px;
          padding: 10px 12px;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
          width: 100%;
        }

        .kaku-delete-project:hover {
          background: rgba(255,77,77,0.18);
          border-color: rgba(255,99,99,0.72);
          color: #ffe1e1;
        }

        .kaku-photo-panel {
          border-top: 1px solid rgba(255,255,255,0.12);
          margin-top: 28px;
          padding-top: 22px;
        }

        .kaku-photo-heading > div:first-child {
          align-items: center;
          display: flex;
          gap: 14px;
        }

        .kaku-photo-heading strong {
          font-size: 22px;
        }

        .kaku-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }

        .kaku-photo-card {
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 9px;
          background: rgba(255,255,255,0.045);
          color: #f4f0e8;
          cursor: pointer;
          overflow: hidden;
          padding: 0;
          text-align: left;
        }

        .kaku-photo-card img,
        .kaku-image-missing {
          aspect-ratio: 4 / 3;
          background: #171717;
        }

        .kaku-photo-card span,
        .kaku-photo-card em {
          display: block;
          overflow: hidden;
          padding: 8px 10px 0;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .kaku-photo-card em {
          color: #c9a46a;
          font-size: 12px;
          font-style: normal;
          padding-bottom: 10px;
        }

        .kaku-empty {
          border: 1px dashed rgba(255,255,255,0.14);
          border-radius: 10px;
          color: rgba(244,240,232,0.54);
          display: grid;
          min-height: 160px;
          place-items: center;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CategoryButton({
  category,
  isActive,
  isChild,
  onSelect,
  onRename,
  onDelete,
}: {
  category: CategoryDoc;
  isActive: boolean;
  isChild?: boolean;
  onSelect: (id: string) => void;
  onRename: (category: CategoryDoc) => void;
  onDelete: (category: CategoryDoc) => void;
}) {
  return (
    <div className={`kaku-category ${isActive ? "active" : ""} ${isChild ? "child" : ""}`}>
      <button type="button" onClick={() => onSelect(category._id)}>
        {isChild ? "└ " : "▾ "}
        {category.title}
      </button>
      <span className="kaku-category-actions">
        <button
          type="button"
          title="重新命名"
          onClick={(event) => {
            event.stopPropagation();
            onRename(category);
          }}
        >
          編輯名稱
        </button>
        <button
          type="button"
          className="danger"
          title="刪除"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(category);
          }}
        >
          刪除
        </button>
      </span>
    </div>
  );
}

function CategoryTreeButton({
  category,
  isActive,
  isExpanded,
  isChild,
  projectCount = 0,
  onSelect,
  onToggle,
  onRename,
  onDelete,
}: {
  category: CategoryDoc;
  isActive: boolean;
  isExpanded: boolean;
  isChild?: boolean;
  projectCount?: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (category: CategoryDoc) => void;
  onDelete: (category: CategoryDoc) => void;
}) {
  return (
    <div className={`kaku-category ${isActive ? "active" : ""} ${isChild ? "child" : ""}`}>
      <button
        type="button"
        onClick={() => {
          onSelect(category._id);
          onToggle(category._id);
        }}
      >
        <span className="kaku-tree-chevron">{isExpanded ? "⌄" : "›"}</span>
        <span className="kaku-tree-icon">{isChild ? "□" : "▣"}</span>
        <span className="kaku-tree-name">{categoryTitle(category)}</span>
        {projectCount > 0 ? <small>{projectCount}</small> : null}
      </button>
      <span className="kaku-category-actions">
        <button
          type="button"
          title="編輯名稱"
          onClick={(event) => {
            event.stopPropagation();
            onRename(category);
          }}
        >
          編輯
        </button>
        <button
          type="button"
          className="danger"
          title="刪除"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(category);
          }}
        >
          刪除
        </button>
      </span>
    </div>
  );
}

function ProjectTreeItem({
  project,
  isActive,
  onSelect,
}: {
  project: ProjectDoc;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`kaku-project-tree-item ${isActive ? "active" : ""}`}
      onClick={() => onSelect(project._id)}
    >
      <span className="kaku-tree-spacer" />
      <span className="kaku-project-dot" />
      <span className="kaku-tree-name">{projectTitle(project)}</span>
      <small>{project.galleryImages?.length ?? 0}</small>
    </button>
  );
}

function ProjectCard({
  project,
  categories,
  isActive,
  onSelect,
  onMove,
  onDelete,
}: {
  project: ProjectDoc;
  categories: CategoryDoc[];
  isActive: boolean;
  onSelect: (id: string) => void;
  onMove: (projectId: string, categoryId: string) => void;
  onDelete: (project: ProjectDoc) => void;
}) {
  const cover =
    project.coverImage ??
    project.galleryImages?.find((item) => item.isCover) ??
    project.galleryImages?.[0];
  const categoryNames = project.categories?.map((category) => category.title).join(" / ");

  return (
    <article
      role="button"
      tabIndex={0}
      className={`kaku-project-card ${isActive ? "active" : ""}`}
      onClick={() => onSelect(project._id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(project._id);
        }
      }}
    >
      <div className="kaku-cover">
        {imageUrl(cover) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(cover)} alt="" />
        ) : null}
      </div>
      <div className="kaku-project-info">
        <strong>{project.title}</strong>
        <p>{project.shootingDate || "尚未設定拍攝日期"}</p>
        <p>{categoryNames || "尚未分類"}</p>
        <span>{project.galleryImages?.length ?? 0} 張照片</span>
        <select
          value={project.categories?.[0]?._id ?? ""}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            if (event.target.value) {
              onMove(project._id, event.target.value);
            }
          }}
        >
          <option value="">移動到分類</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.parentCategory
                ? `${category.parentCategory.title} / ${category.title}`
                : category.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="kaku-delete-project"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(project);
          }}
        >
          刪除作品集
        </button>
      </div>
    </article>
  );
}
