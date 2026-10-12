(function () {
'use strict';
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { slug: null, gal: null, heroes: null, lb: -1 };
    var self = this;
    this.onHash = function () { self.setState({ slug: self.readSlug(), lb: -1 }); try { window.scrollTo({ top: 0 }); } catch (e) {} };
  }
  projects() { return window.TINGS_PROJECTS || []; }

  readSlug() {
    var h = '';
    try { h = (window.location.hash || '').replace('#', ''); } catch (e) {}
    if (!h) { try { var m = (window.location.search || '').match(/[?&]p=([^&]+)/); if (m) { h = m[1]; } } catch (e) {} }
    var list = this.projects();
    for (var i = 0; i < list.length; i++) { if (list[i].slug === h) { return h; } }
    return list[0].slug;
  }
  show(slug) {
    this.setState({ slug: slug, lb: -1 });
    try { if (window.location.hash !== '#' + slug) { history.replaceState(null, '', '#' + slug); } } catch (e) {}
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }
  componentDidMount() {
    this.setState({ slug: this.readSlug(), gal: {}, heroes: {} });
    window.addEventListener('hashchange', this.onHash);
  }

  componentWillUnmount() { window.removeEventListener('hashchange', this.onHash); }
  heroOf(p) { return p.hero; }
  images(p) {
    var out = [{ src: p.hero, alt: p.name }];
    (p.gallery || []).forEach(function (x, k) { out.push({ src: x.src, alt: p.name + ', image ' + (k + 2), draw: x.draw }); });
    return out;
  }

  renderVals() {
    var self = this, st = this.state, list = this.projects();
    var idx = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].slug === st.slug) { idx = i; } }
    var p = list[idx], nx = list[(idx + 1) % list.length], pv = list[(idx - 1 + list.length) % list.length];
    var imgs = this.images(p);
    var loading = st.gal === null;
    var rest = imgs.slice(1);
    var gal = rest.map(function (x, k) {
      var full = (k % 3 === 0) || (k === rest.length - 1 && rest.length % 3 === 2);
      return { src: x.src, alt: x.alt, n: k + 2, cls: 'gi ' + (full ? 'full' : 'half') + (x.draw ? ' draw' : ''), open: function () { self.setState({ lb: k + 1 }); } };
    });
    var lb = st.lb;
    var locOf = function (q) { return (q.meta.filter(function (m) { return m[0] === 'location'; })[0] || ['', ''])[1]; };
    var facts = [{ k: 'category', v: p.cat }, { k: 'type', v: p.type }].concat(p.meta.map(function (m) { return { k: m[0], v: m[1] }; }));
    return {
      p: { slug: p.slug, name: p.name, cat: p.cat, type: p.type, intro: p.intro, story: p.story, quote: p.quote || '', loc: locOf(p) },
      heroSrc: this.heroOf(p),
      heroCls: st.heroes ? '' : 'lo',
      pos: (idx + 1 < 10 ? '0' : '') + (idx + 1) + ' / ' + list.length,
      total: list.length,
      facts: facts,
      hasQuote: !!p.quote,
      hasGal: loading || gal.length > 0,
      galLoading: loading,
      gal: gal,
      galCount: loading ? '' : imgs.length + ' images',
      openHero: function () { self.setState({ lb: 0 }); },
      goPrev: function () { self.show(pv.slug); },
      goNext: function (e) { if (e && e.preventDefault) { e.preventDefault(); } self.show(nx.slug); },
      nextHref: '#' + nx.slug,
      nextName: nx.name,
      nextHero: nx.hero,
      all: list.map(function (q) { var cur = q.slug === p.slug; return { name: q.name, loc: locOf(q), hero: q.hero, cls: cur ? 'mc cur' : 'mc', cur: cur ? 'page' : 'false', go: function () { if (!cur) { self.show(q.slug); } } }; }),
      lbOpen: lb >= 0,
      lbSrc: lb >= 0 ? imgs[Math.min(lb, imgs.length - 1)].src : '',
      lbAlt: lb >= 0 ? imgs[Math.min(lb, imgs.length - 1)].alt : '',
      lbCount: lb >= 0 ? (lb + 1) + ' / ' + imgs.length : '',
      lbMulti: imgs.length > 1,
      lbClose: function (e) { if (e && e.stopPropagation) { e.stopPropagation(); } self.setState({ lb: -1 }); },
      lbBackdrop: function (e) { if (e && e.target === e.currentTarget) { self.setState({ lb: -1 }); } },
      lbPrev: function (e) { if (e && e.stopPropagation) { e.stopPropagation(); } self.setState({ lb: (self.state.lb - 1 + imgs.length) % imgs.length }); },
      lbNext: function (e) { if (e && e.stopPropagation) { e.stopPropagation(); } self.setState({ lb: (self.state.lb + 1) % imgs.length }); }
    };
  }
}

window.mountDC(document.getElementById('app'), Component, document.getElementById('tpl'));
})();
