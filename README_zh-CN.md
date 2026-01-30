# chriscurry.cc

<div align="center">

[English](./README.md) | [繁體中文](./README_zh-TW.md) | [日本語](./README_ja.md)

</div>

## 致谢

本项目 fork 自 [mengke.me](https://github.com/mk965/mengke.me)，感谢 [@mk965](https://github.com/mk965) 的出色工作！

## 关于我的博客

本博客暂时还没有长文章。我通过 [Memos](https://github.com/chriscurrycc/memos) 来发表短想法，记录所有能记录的东西。最近公开的 memos 可以在博客首页看到。

我还集成了浇花记录和日记，在 [/pets/care-events](https://chriscurry.cc/pets/care-events) 和 [/pets/notes](https://chriscurry.cc/pets/notes) 页面。

后续还会做很多好玩的功能，也可能会恢复写长文章，敬请期待！

## 技术栈

- 🪤 托管在 [Vercel](https://vercel.com/)
- 🧱 使用 **React 18+**、**NextJS 14+** 构建
- 📊 使用 [Umami](https://umami.is/) 进行网站分析
- 🎉 采用 **Typescript**，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

## 如何部署类似的博客？

### 1. 安装

1. Clone 或 fork 本仓库

2. 运行 `pnpm install` 安装依赖

### 2. 修改数据

1. 将根目录下的 `.env.example` 文件重命名为 `.env` 并修改其中的值

2. 更新 `/data` 目录下的文件，这些文件包含博客数据

### 3. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc&env=NEXT_PUBLIC_GISCUS_REPO,NEXT_PUBLIC_GISCUS_REPOSITORY_ID,NEXT_PUBLIC_GISCUS_CATEGORY,NEXT_PUBLIC_GISCUS_CATEGORY_ID,NEXT_UMAMI_ID,SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,SPOTIFY_REFRESH_TOKEN,DATABASE_URL,GITHUB_API_TOKEN&envDescription=Giscus%5CUmami%5CSpotify%5CData%5CGithub&envLink=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc%2Fblob%2Fmain%2F.env.example&project-name=chriscurry-cc&repository-name=chriscurry-cc)

### 4. 博客访问量也可以免费存储在 Vercel

1. 在 Vercel 中创建 `Postgres Database`

2. 你会得到类似这样的字符串：`postgres://default:xxxxx@xx-xx-xx-xxxx.us-xx-x.postgres.vercel-storage.com:xxx/verceldb`，将其添加到 `DATABASE_URL` 变量中

3. 每篇博客的访问量将自动统计到这个数据库中
