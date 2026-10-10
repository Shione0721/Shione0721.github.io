
const fs = require('fs');
function decode(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&hellip;/g, '…').replace(/&mdash;/g, '—');
}
function stripTags(s) {
  return decode(s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim();
}
function inlineMd(s) {
  let t = s.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<(b|strong)>(.*?)<\/\1>/gis, '**$2**');
  t = t.replace(/<(i|em)>(.*?)<\/\1>/gis, '*$2*');
  t = t.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, '[$2]($1)');
  t = t.replace(/<code>(.*?)<\/code>/gis, '`$1`');
  return decode(t.replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim();
}
function htmlToMd(html) {
  const m = html.match(/<div class="article-entry"[\s\S]*?(?=<div class="article-info|<\/article>)/);
  let body = m ? m[0] : html;
  body = body.replace(/<figure[\s\S]*?<\/figure>/gi, '');
  const out = [];
  const re = /<(h[1-6]|p|blockquote|li|hr|img)([^>]*)>([\s\S]*?)(?:<\/\1>|$)/gi;
  let mm;
  while ((mm = re.exec(body)) !== null) {
    const tag = mm[1].toLowerCase(), attrs = mm[2] || '', inner = mm[3] || '';
    if (tag === 'hr') { out.push('---'); continue; }
    if (tag === 'img') {
      const src = (attrs.match(/src="([^"]*)"/) || [])[1];
      if (src) out.push('![配图](' + src + ')');
      continue;
    }
    if (tag === 'li') { const t = inlineMd(inner); if (t) out.push('- ' + t); continue; }
    if (tag.startsWith('h')) { const t = stripTags(inner); if (t) out.push('## ' + t); continue; }
    if (tag === 'blockquote') { const t = stripTags(inner); if (t) t.split('\n').forEach(l => out.push('> ' + l.trim())); continue; }
    const t = inlineMd(inner);
    if (t) out.push(t);
  }
  return out.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}
const jobs = [
  ['F:/github-旧仓库备份/dbyyj.github.io/2022/01/29/\u201c\u6c50\u5b81\u201d\u7684\u603b\u7ed3/index.html',
   '汐宁的总结', '2022-01-29 20:00:00', ['随笔'], ['随笔', 'GAL']],
  ['F:/github-旧仓库备份/dbyyj.github.io/2022/01/18/\u4f5c\u4e3a\u542c\u6b4c\u4eba\u7684\u6211\uff08\u4e00\uff09/index.html',
   '作为听歌人的我（一）', '2022-01-18 20:00:00', ['随笔'], ['随笔', '音乐']]
];
const logs = [];
for (const [src, title, date, cats, tags] of jobs) {
  const html = fs.readFileSync(src, 'utf8');
  const md = htmlToMd(html);
  const fm = '---\ntitle: ' + title + '\ndate: ' + date + '\ncategories:\n' +
    cats.map(c => '  - ' + c).join('\n') + '\ntags:\n' + tags.map(t => '  - ' + t).join('\n') + '\n---\n\n';
  const out = 'C:/Users/29245/Documents/shione-blog/source/_posts/' + title + '.md';
  fs.writeFileSync(out, fm + md + '\n', 'utf8');
  logs.push(title + ' | ' + md.length + '字 | ' + (md.match(/^> /gm) || []).length + ' 引用行');
}
console.log(logs.join('\n'));
