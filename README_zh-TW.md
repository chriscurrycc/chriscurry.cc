# chriscurry.cc

<div align="center">

[English](./README.md) | [简体中文](./README_zh-CN.md) | [日本語](./README_ja.md)

</div>

## 致謝

本專案 fork 自 [mengke.me](https://github.com/mk965/mengke.me)，感謝 [@mk965](https://github.com/mk965) 的出色工作！

## 關於我的部落格

本部落格暫時還沒有長文章。我透過 [Memos](https://github.com/chriscurrycc/memos) 來發表短想法，記錄所有能記錄的東西。最近公開的 memos 可以在部落格首頁看到。

我還整合了澆花記錄和日記，在 [/pets/care-events](https://chriscurry.cc/pets/care-events) 和 [/pets/notes](https://chriscurry.cc/pets/notes) 頁面。

後續還會做很多好玩的功能，也可能會恢復寫長文章，敬請期待！

## 技術棧

- 🪤 託管在 [Vercel](https://vercel.com/)
- 🧱 使用 **React 18+**、**NextJS 14+** 構建
- 📊 使用 [Umami](https://umami.is/) 進行網站分析
- 🎉 採用 **Typescript**，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範

## 如何部署類似的部落格？

### 1. 安裝

1. Clone 或 fork 本倉庫

2. 執行 `pnpm install` 安裝依賴

### 2. 修改資料

1. 將根目錄下的 `.env.example` 檔案重新命名為 `.env` 並修改其中的值

2. 更新 `/data` 目錄下的檔案，這些檔案包含部落格資料

### 3. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc&env=NEXT_PUBLIC_GISCUS_REPO,NEXT_PUBLIC_GISCUS_REPOSITORY_ID,NEXT_PUBLIC_GISCUS_CATEGORY,NEXT_PUBLIC_GISCUS_CATEGORY_ID,NEXT_UMAMI_ID,SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,SPOTIFY_REFRESH_TOKEN,DATABASE_URL,GITHUB_API_TOKEN&envDescription=Giscus%5CUmami%5CSpotify%5CData%5CGithub&envLink=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc%2Fblob%2Fmain%2F.env.example&project-name=chriscurry-cc&repository-name=chriscurry-cc)

### 4. 部落格訪問量也可以免費儲存在 Vercel

1. 在 Vercel 中建立 `Postgres Database`

2. 你會得到類似這樣的字串：`postgres://default:xxxxx@xx-xx-xx-xxxx.us-xx-x.postgres.vercel-storage.com:xxx/verceldb`，將其添加到 `DATABASE_URL` 變數中

3. 每篇部落格的訪問量將自動統計到這個資料庫中
