"use client";

const cards = [
  {
    title: "Projects",
    description: "建立作品集、上傳整組照片、設定封面與分類。",
    href: "/studio/structure/project",
  },
  {
    title: "Homepage Carousel",
    description: "從作品集中挑選首頁輪播照片，並拖曳調整順序。",
    href: "/studio/structure/homepageCarousel;homepageCarousel",
  },
];

export default function StudioDashboard() {
  return (
    <main style={{ minHeight: "100%", background: "#101010", color: "#f3eee6", padding: "48px" }}>
      <section style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <p style={{ color: "#c9a46a", letterSpacing: "0.32em", textTransform: "uppercase", fontSize: 13 }}>
          KAKU Photography Studio
        </p>
        <h1 style={{ marginTop: 18, fontSize: 46, fontWeight: 300, lineHeight: 1.1 }}>
          Dashboard
        </h1>
        <p style={{ marginTop: 18, maxWidth: 680, color: "rgba(243,238,230,0.68)", fontSize: 18, lineHeight: 1.8 }}>
          這裡只保留攝影作品相關操作：上傳作品集照片、設定封面，以及整理首頁輪播。
        </p>

        <div
          style={{
            marginTop: 42,
            border: "1px dashed rgba(201,164,106,0.45)",
            background: "rgba(201,164,106,0.08)",
            padding: 28,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>拖曳資料夾上傳作品</h2>
          <p style={{ marginTop: 12, color: "rgba(243,238,230,0.66)", fontSize: 16, lineHeight: 1.75 }}>
            進入 Projects，新增一個作品集後，在「整組作品照片」欄位中可一次選取多張照片上傳。
            上傳完成後，在照片預覽裡勾選一張「設為封面」。
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20, marginTop: 28 }}>
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              style={{
                display: "block",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.035)",
                padding: 28,
                color: "#f3eee6",
                textDecoration: "none",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 25, fontWeight: 400 }}>{card.title}</h2>
              <p style={{ marginTop: 12, color: "rgba(243,238,230,0.58)", fontSize: 15, lineHeight: 1.7 }}>
                {card.description}
              </p>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 46 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400 }}>最近作品</h2>
          <p style={{ marginTop: 10, color: "rgba(243,238,230,0.58)", fontSize: 15 }}>
            最近作品可在 Projects 中依更新時間查看；目前 Dashboard 保持簡潔，只作為操作入口。
          </p>
        </div>
      </section>
    </main>
  );
}
