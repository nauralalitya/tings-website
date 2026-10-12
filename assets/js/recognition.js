(function () {
'use strict';
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { data: null }; }
  componentDidMount() { this.setState({ data: { people: ["/assets/img/team/principal-1.jpg", "/assets/img/team/principal-2.jpg", "/assets/img/team/principal-3.jpg"], awards: ["/assets/img/awards/award-1.jpg", "/assets/img/awards/award-2.jpg", "/assets/img/awards/award-3.jpg", "/assets/img/awards/award-4.jpg", "/assets/img/awards/award-5.jpg"] } }); }

  img(kind, i) { var d = this.state.data; return (d && d[kind] && d[kind][i]) || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; }
  renderVals() {
    var self = this, loaded = !!this.state.data;
    var A = [
      ['3rd winner', '2025', 'sayembara masterplan museum majapahit', 'mojokerto, indonesia'],
      ['2nd winner', '2022', 'sayembara stadion brantas kota batu', 'malang, indonesia'],
      ['2nd winner', '2021', 'sayembara villa tropis', 'tanjung lesung, banten'],
      ['3rd winner', '2018', 'sayembara kawasan kalibuntung sleman', 'sleman, indonesia'],
      ['1st winner', '2017', 'sayembara gedung fakultas hukum uii', 'yogyakarta, indonesia']
    ];
    return { awards: A.map(function (a, i) { return { rank: a[0], rcls: a[0].indexOf('1st') === 0 ? 'rank first' : 'rank', year: a[1], title: a[2], loc: a[3], src: self.img('awards', i), op: loaded ? '1' : '0' }; }) };
  }
}

window.mountDC(document.getElementById('app'), Component, document.getElementById('tpl'));
})();
