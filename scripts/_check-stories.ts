import { createClient } from '@supabase/supabase-js';
async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { data } = await sb.from('homepage_content').select('top_stories').order('generated_at', { ascending: false }).limit(1);
  const stories = (data?.[0]?.top_stories ?? []) as any[];
  stories.slice(0, 4).forEach((s: any, i: number) => {
    console.log(`${i+1}. [${s.image ? 'IMG' : 'NO IMG'}] ${s.source} | ${s.headline.slice(0, 80)}`);
    if (s.image) console.log(`   -> ${s.image.slice(0, 120)}`);
  });
}
main();
