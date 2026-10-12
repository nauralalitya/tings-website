(function () {
'use strict';
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { data: null }; }
  componentDidMount() { this.setState({ data: { people: ["/assets/img/team/principal-1.jpg", "/assets/img/team/principal-2.jpg", "/assets/img/team/principal-3.jpg"], awards: ["/assets/img/awards/award-1.jpg", "/assets/img/awards/award-2.jpg", "/assets/img/awards/award-3.jpg", "/assets/img/awards/award-4.jpg", "/assets/img/awards/award-5.jpg"] } }); }

  img(kind, i) { var d = this.state.data; return (d && d[kind] && d[kind][i]) || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; }
  renderVals() {
    var self = this, loaded = !!this.state.data;
    var P = [['ar. arif rasipu, iai', 'studio principal'], ['ar. nadya p. azzura, iai', 'studio principal'], ['ar. naura h. lalitya c., mba, iai', 'studio principal']];
    return { people: P.map(function (p, i) { return { name: p[0], role: p[1], src: self.img('people', i), op: loaded ? '1' : '0' }; }) };
  }
}

window.mountDC(document.getElementById('app'), Component, document.getElementById('tpl'));
})();
