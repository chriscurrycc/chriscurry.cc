# chriscurry.cc

<div align="center">

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md)

</div>

## 謝辞

このプロジェクトは [mengke.me](https://github.com/mk965/mengke.me) からフォークしました。[@mk965](https://github.com/mk965) の素晴らしい仕事に感謝します！

## このブログについて

このブログにはまだ長い記事がありません。[Memos](https://github.com/chriscurrycc/memos) で短い考えを共有し、記録できるすべてのことを記録しています。最近の公開メモはブログのホームページで見ることができます。

また、水やり記録と日記を [/pets/care-events](https://chriscurry.cc/pets/care-events) と [/pets/notes](https://chriscurry.cc/pets/notes) ページに統合しました。

今後も面白い機能を追加していく予定で、長い記事を書き始めるかもしれません。お楽しみに！

## 技術スタック

- 🪤 [Vercel](https://vercel.com/) でホスティング
- 🧱 **React 18+**、**NextJS 14+** で構築
- 📊 [Umami](https://umami.is/) でサイト分析
- 🎉 **Typescript** を採用、[Conventional Commits](https://www.conventionalcommits.org/) に準拠

## 同様のブログをデプロイする方法

### 1. インストール

1. このリポジトリをクローンまたはフォーク

2. `pnpm install` を実行して依存関係をインストール

### 2. データの変更

1. ルートディレクトリの `.env.example` ファイルを `.env` にリネームし、値を変更

2. `/data` ディレクトリ内のファイルを更新（ブログデータが含まれています）

### 3. Vercel にデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc&env=NEXT_PUBLIC_GISCUS_REPO,NEXT_PUBLIC_GISCUS_REPOSITORY_ID,NEXT_PUBLIC_GISCUS_CATEGORY,NEXT_PUBLIC_GISCUS_CATEGORY_ID,NEXT_UMAMI_ID,SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,SPOTIFY_REFRESH_TOKEN,DATABASE_URL,GITHUB_API_TOKEN&envDescription=Giscus%5CUmami%5CSpotify%5CData%5CGithub&envLink=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc%2Fblob%2Fmain%2F.env.example&project-name=chriscurry-cc&repository-name=chriscurry-cc)

### 4. ブログの閲覧数も Vercel で無料で保存可能

1. Vercel で `Postgres Database` を作成

2. `postgres://default:xxxxx@xx-xx-xx-xxxx.us-xx-x.postgres.vercel-storage.com:xxx/verceldb` のような文字列が取得できます。これを `DATABASE_URL` 変数に追加

3. 各ブログ記事の閲覧数がこのデータベースに自動的に記録されます
