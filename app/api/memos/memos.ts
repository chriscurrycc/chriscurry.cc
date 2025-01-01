const { MEMOS_API_TOKEN, MEMOS_HOST } = process.env

if (!MEMOS_API_TOKEN || !MEMOS_HOST) {
  throw new Error('Missing required environment variables for Memos API')
}

export async function getMemos() {
  const url = new URL(`${MEMOS_HOST}/api/v1/memos`)
  // Add fixed query parameters
  url.searchParams.append('pageSize', '20')
  url.searchParams.append('filter', "creator=='users/1'&&visibilities == ['PUBLIC']")

  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${MEMOS_API_TOKEN}`,
    },
    cache: 'no-store',
  })
}
