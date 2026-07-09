import { readFileSync, writeFileSync } from 'fs'

const mapping = JSON.parse(readFileSync('scripts/out/track-slug-mapping.json', 'utf-8'))
const rows = Object.entries(mapping)
  .filter(([oldSlug, newSlug]) => newSlug && oldSlug !== newSlug)
  .map(([o, n]) => `('${o.replace(/'/g, "''")}', '${n.replace(/'/g, "''")}')`)

const sql = `
create temp table track_slug_map(old_slug text primary key, new_slug text);
insert into track_slug_map(old_slug, new_slug) values
${rows.join(',\n')};

-- Dedupe: a user may end up liking the same canonical track via different legacy slugs.
delete from track_likes tl using track_slug_map m, track_likes keep
  where tl.track_slug = m.old_slug
    and keep.user_id = tl.user_id and keep.track_slug = m.new_slug;
update track_likes tl set track_slug = m.new_slug
  from track_slug_map m where tl.track_slug = m.old_slug;

insert into track_plays(track_slug, play_count)
  select m.new_slug, sum(tp.play_count) from track_plays tp
  join track_slug_map m on m.old_slug = tp.track_slug
  group by m.new_slug
on conflict (track_slug) do update set play_count = track_plays.play_count + excluded.play_count;
delete from track_plays tp using track_slug_map m where tp.track_slug = m.old_slug;

select
  (select count(*) from track_likes) as likes_total,
  (select count(*) from track_likes where track_slug in (select old_slug from track_slug_map)) as likes_legacy_left,
  (select count(*) from track_plays where track_slug in (select old_slug from track_slug_map)) as plays_legacy_left;
`
writeFileSync('scripts/out/20260707_remap_track_slugs.sql', sql)
console.log(`remap rows: ${rows.length}`)
