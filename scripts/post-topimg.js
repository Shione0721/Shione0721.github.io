// 安知鱼主题的文章页横幅只认 page.top_img（不会回退 theme.default_top_img），
// 这里给所有文章统一补一个默认横幅，新写的文章不必每篇手填。
hexo.extend.filter.register('before_post_render', function (data) {
  if (data.layout === 'post' && !data.top_img) {
    data.top_img = hexo.theme.config.default_top_img || '/img/hero-bg.png';
  }
  return data;
});
