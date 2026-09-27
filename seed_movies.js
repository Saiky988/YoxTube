// Seed script to ingest movies into YoxTube production database via On-Demand API
const fetch = globalThis.fetch;

async function crawlMovie(slug) {
  try {
    const res = await fetch(`https://api.yoxtube.xyz/api/movies/${slug}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (data.success && data.data?.title) {
      console.log(`[OK] Ingested: "${data.data.title}" | Type: ${data.data.type} | Year: ${data.data.releaseYear}`);
      return true;
    } else {
      console.log(`[SKIP/FAIL] ${slug}:`, data.error?.message || 'Unknown response');
      return false;
    }
  } catch (err) {
    console.error(`[ERR] ${slug}:`, err.message);
    return false;
  }
}

async function getSlugsFromVSMOV(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const json = JSON.parse(text);
    const items = json.items || [];
    return items.map(i => i.slug).filter(Boolean);
  } catch (e) {
    console.error(`Error fetching VSMOV list from ${url}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('Fetching lists from VSMOV...');
  const p1 = await getSlugsFromVSMOV('https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=1');
  const p2 = await getSlugsFromVSMOV('https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=2');
  const p3 = await getSlugsFromVSMOV('https://vsmov.com/api/danh-sach/phim-le?page=1');
  const p4 = await getSlugsFromVSMOV('https://vsmov.com/api/danh-sach/phim-le?page=2');

  const famousSlugs = [
    'avatar-dong-chay-cua-nuoc',
    'oppenheimer',
    'sinh-vat-ky-sinh-the-xanh',
    'nu-hoang-nuoc-mat',
    'tro-choi-con-muc',
    'chuyen-doi-bac-si',
    'one-piece-live-action',
    'nguoi-hung-thanh-troy',
    'babe-chu-heo-chan-cuu',
    'gia-gan-tra-dua',
    'the-gioi-hoan-hao',
    'bac-si-cha',
    'bac-si-john'
  ];

  const allSlugs = Array.from(new Set([
    ...famousSlugs,
    ...p3,
    ...p4,
    ...p1,
    ...p2
  ])).filter(Boolean);

  console.log(`Total unique slugs to ingest: ${allSlugs.length}`);

  let successCount = 0;
  for (let i = 0; i < allSlugs.length; i++) {
    const slug = allSlugs[i];
    process.stdout.write(`[${i + 1}/${allSlugs.length}] Ingesting: ${slug}... `);
    const ok = await crawlMovie(slug);
    if (ok) successCount++;
    // Small delay between requests
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n===========================================`);
  console.log(`Ingestion completed! ${successCount}/${allSlugs.length} movies successfully synced to https://api.yoxtube.xyz`);
  console.log(`===========================================`);
}

main();
