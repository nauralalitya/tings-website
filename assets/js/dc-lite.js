/* dc-lite: a very small template runtime for the tings site.
   supports {{path}} interpolation, <sc-for list as>, <sc-if value>,
   on* event attributes, ref callbacks, and a class with state + renderVals(). */
(function () {
  'use strict';
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (u) {
    var self = this;
    var patch = typeof u === 'function' ? u(this.state) : u;
    for (var k in patch) { if (Object.prototype.hasOwnProperty.call(patch, k)) { this.state[k] = patch[k]; } }
    if (!this.__queued) { this.__queued = true; Promise.resolve().then(function () { self.__queued = false; if (self.__render) { self.__render(); } }); }
  };
  window.DCLogic = DCLogic;

  var EVENTS = { onclick: 'click', onmouseenter: 'mouseenter', onfocus: 'focus', onchange: 'change', oninput: 'input', onkeydown: 'keydown' };
  var BOOL = { disabled: 1, checked: 1, hidden: 1, selected: 1 };

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') { return true; }
    if (path === 'false') { return false; }
    var parts = path.split('.'), cur;
    for (var i = scope.length - 1; i >= 0; i--) {
      if (scope[i] && Object.prototype.hasOwnProperty.call(scope[i], parts[0])) { cur = scope[i][parts[0]]; break; }
    }
    for (var j = 1; j < parts.length && cur != null; j++) { cur = cur[parts[j]]; }
    return cur;
  }
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;
  function interp(str, scope) {
    return str.replace(/\{\{([^}]+)\}\}/g, function (_, p) { var v = lookup(scope, p); return v == null ? '' : String(v); });
  }
  function value(str, scope) { var m = str.match(WHOLE); return m ? lookup(scope, m[1]) : interp(str, scope); }

  function build(node, scope, out) {
    if (node.nodeType === 3) { out.push(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) { return; }
    var tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      var list = value(node.getAttribute('list'), scope) || [], as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) {
        var s = {}; s[as] = list[i];
        var sc = scope.concat([s]);
        for (var c = 0; c < node.childNodes.length; c++) { build(node.childNodes[c], sc, out); }
      }
      return;
    }
    if (tag === 'sc-if') {
      var v = value(node.getAttribute('value'), scope);
      if (v && v !== 'false') { for (var d = 0; d < node.childNodes.length; d++) { build(node.childNodes[d], scope, out); } }
      return;
    }
    var el = document.createElement(tag);
    el.__h = {};
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, lname = name.toLowerCase();
      if (EVENTS[lname]) {
        var fn = value(at.value, scope), ev = EVENTS[lname];
        if (ev === 'change' && (tag === 'input' || tag === 'textarea') && node.getAttribute('type') !== 'checkbox') { ev = 'input'; }
        if (typeof fn === 'function') { el.__h[ev] = fn; }
        continue;
      }
      if (lname === 'ref') { var r = value(at.value, scope); if (typeof r === 'function') { el.__ref = r; } continue; }
      if (lname.indexOf('hint-') === 0 || lname === 'key') { continue; }
      var val = value(at.value, scope);
      if (BOOL[lname]) { if (val === true || (val && val !== 'false')) { el.setAttribute(lname, ''); } continue; }
      if (lname === 'value') { el.__value = val == null ? '' : String(val); el.setAttribute('value', el.__value); continue; }
      el.setAttribute(name, val == null ? '' : String(val));
    }
    var kids = [];
    for (var k = 0; k < node.childNodes.length; k++) { build(node.childNodes[k], scope, kids); }
    kids.forEach(function (n) { el.appendChild(n); });
    out.push(el);
  }

  function dispatch(e) { var h = this.__h && this.__h[e.type]; if (h) { h.call(this, e); } }
  function bind(el) {
    if (el.nodeType !== 1) { return; }
    el.__bound = el.__bound || {};
    for (var t in el.__h) { if (!el.__bound[t]) { el.addEventListener(t, dispatch); el.__bound[t] = 1; } }
    if (el.__value != null && el.value !== el.__value && document.activeElement !== el) { el.value = el.__value; }
    if (el.type === 'checkbox') { el.checked = el.hasAttribute('checked'); }
    if (el.__ref) { el.__ref(el); }
    for (var i = 0; i < el.childNodes.length; i++) { bind(el.childNodes[i]); }
  }
  function patch(parent, oldN, newN) {
    if (!oldN) { parent.appendChild(newN); bind(newN); return; }
    if (oldN.nodeType !== newN.nodeType || (oldN.nodeType === 1 && oldN.tagName !== newN.tagName)) { parent.replaceChild(newN, oldN); bind(newN); return; }
    if (oldN.nodeType === 3) { if (oldN.nodeValue !== newN.nodeValue) { oldN.nodeValue = newN.nodeValue; } return; }
    var i, a;
    for (i = oldN.attributes.length - 1; i >= 0; i--) { a = oldN.attributes[i].name; if (!newN.hasAttribute(a)) { oldN.removeAttribute(a); } }
    for (i = 0; i < newN.attributes.length; i++) { a = newN.attributes[i]; if (oldN.getAttribute(a.name) !== a.value) { oldN.setAttribute(a.name, a.value); } }
    oldN.__h = newN.__h; oldN.__ref = newN.__ref; oldN.__value = newN.__value;
    oldN.__bound = oldN.__bound || {};
    for (var t in oldN.__h) { if (!oldN.__bound[t]) { oldN.addEventListener(t, dispatch); oldN.__bound[t] = 1; } }
    if (oldN.__value != null && oldN.value !== oldN.__value && document.activeElement !== oldN) { oldN.value = oldN.__value; }
    if (oldN.type === 'checkbox') { oldN.checked = newN.hasAttribute('checked'); }
    if (oldN.__ref) { oldN.__ref(oldN); }
    var oc = [].slice.call(oldN.childNodes), nc = [].slice.call(newN.childNodes);
    for (i = 0; i < nc.length; i++) { patch(oldN, oc[i], nc[i]); }
    for (i = nc.length; i < oc.length; i++) { oldN.removeChild(oc[i]); }
  }

  window.mountDC = function (root, Component, tplEl) {
    var src = tplEl.content;
    root.innerHTML = '';
    var inst = new Component({});
    function render() {
      var vals = inst.renderVals ? inst.renderVals() : {};
      var out = [];
      for (var i = 0; i < src.childNodes.length; i++) { build(src.childNodes[i], [vals], out); }
      var cur = [].slice.call(root.childNodes);
      for (i = 0; i < out.length; i++) { patch(root, cur[i], out[i]); }
      for (i = out.length; i < cur.length; i++) { root.removeChild(cur[i]); }
    }
    inst.__render = render;
    render();
    root.removeAttribute('hidden');
    if (inst.componentDidMount) { inst.componentDidMount(); }
    window.addEventListener('pagehide', function () { if (inst.componentWillUnmount) { inst.componentWillUnmount(); } });
    return inst;
  };
})();
