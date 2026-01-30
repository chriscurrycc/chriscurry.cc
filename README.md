# chriscurry.cc

<div align="center">

[简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [日本語](./README_ja.md)

</div>

## Acknowledgment

This project is forked from [mengke.me](https://github.com/mk965/mengke.me). Thanks to [@mk965](https://github.com/mk965) for the excellent work!

## About My Blog

This blog currently doesn't have long-form articles yet. I share short thoughts and record everything worth documenting via [Memos](https://github.com/chriscurrycc/memos). Recent public memos can be viewed on the blog homepage.

I've also integrated my plant watering records and diary at [/pets/care-events](https://chriscurry.cc/pets/care-events) and [/pets/notes](https://chriscurry.cc/pets/notes) pages.

More fun features are coming in the future, and I might start writing long-form articles again. Stay tuned!

## Tech stack

- 🪤 Hosted on [Vercel](https://vercel.com/).
- 🧱 Built with **React 18+**, **NextJS 14+**.
- 📊 Monitoring site with [Umami](https://umami.is/) website analytics.
- 🎉 Adopting **Typescript**, committing with [Conventional Commits](https://www.conventionalcommits.org/).

## How to deploy a similar blog?

### 1. Installation

1. Clone or fork this repository.

2. Run `pnpm install` to install dependencies.

### 2. Modify data

1. Rename the `.env.example` file in the root directory to `.env` and modify the value in it.

2. Update the information in the files in the `/data` directory, which contains the blog data.

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc&env=NEXT_PUBLIC_GISCUS_REPO,NEXT_PUBLIC_GISCUS_REPOSITORY_ID,NEXT_PUBLIC_GISCUS_CATEGORY,NEXT_PUBLIC_GISCUS_CATEGORY_ID,NEXT_UMAMI_ID,SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,SPOTIFY_REFRESH_TOKEN,DATABASE_URL,GITHUB_API_TOKEN&envDescription=Giscus%5CUmami%5CSpotify%5CData%5CGithub&envLink=https%3A%2F%2Fgithub.com%2Fchriscurrycc%2Fchriscurry.cc%2Fblob%2Fmain%2F.env.example&project-name=chriscurry-cc&repository-name=chriscurry-cc)

### 4. Blog post visits can also be stored in Vercel for free

1. Create a `Postgres Database` in Vercel.

2. You will get a string similar to: `postgres://default:xxxxx@xx-xx-xx-xxxx.us-xx-x.postgres.vercel-storage.com:xxx/verceldb`, add it to the `DATABASE_URL` variable.

3. The number of views of each blog post will be automatically counted in this database.
