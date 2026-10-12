(function () {
'use strict';
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = this.fresh();
    this.state.lang = 'en';
  }
  fresh() {
    return {
      step: 0, mode: 'needs', type: null, sub: 'needs', unlocked: false,
      a: {
        house: { adults: 2, kids: 2, elderly: 0, bedrooms: 3, bathrooms: 2, ensuite: 'yes', cars: 1, parking: 'carport', motors: 2, kitchen: 'one', maid: 'no', pool: 'no', study: 'no', prayer: 'yes', hobby: 'none' },
        cafe: { kind: 'cafe', seatMode: 'seats', seats: 30, customers: 150, kitchen: 'coffee', display: 'small', outdoor: 'no', staff: 'yes', prayer: 'yes' },
        stay: { kind: 'kos', rooms: 10, bath: 'ensuite', size: 'standard', common: 'yes', caretaker: 'yes', parking: 'yes' },
        clinic: { kind: 'general', practice: 2, treatment: 1, pharmacy: 'yes', lab: 'no', prayer: 'yes' }
      },
      land: '', floors: 'auto', loc: 'yogyakarta', quality: 'mid', budget: '',
      name: '', wa: '', email: '', err: '', consent: false, hp: ''
    };
  }
  L(en, id) { return this.state.lang === 'id' ? id : en; }
  tx() {
    var id = this.state.lang === 'id';
    var T = {
      intro: ['answer a few questions about your project. we’ll suggest the floor area you need and the budget it takes to build it, before you even talk to us.', 'jawab beberapa pertanyaan tentang proyek Anda. kami akan menyarankan luas bangunan yang dibutuhkan dan budget untuk membangunnya, bahkan sebelum kita mengobrol.'],
      s0t: ['where would you like to start?', 'mau mulai dari mana?'],
      s0s: ['we can work from the spaces you need, or from the budget you have. both are honest ways to begin.', 'kita bisa mulai dari ruang yang Anda butuhkan, atau dari budget yang Anda punya. keduanya sama baiknya.'],
      s1t: ['what are you building?', 'mau membangun apa?'],
      s1s: ['pick the closest one. you can always talk to us about the details later.', 'pilih yang paling mendekati. detailnya bisa kita bicarakan nanti.'],
      ready: ['your results are ready', 'hasil Anda sudah siap'],
      gateT: ['your space plan is done.', 'rencana ruang Anda sudah selesai.'],
      gateS: ['enter your details to see your fit score, the breakdown by category, and recommendations you can act on right away.', 'masukkan data Anda untuk melihat skor, analisis per kategori, dan rekomendasi yang bisa langsung ditindaklanjuti.'],
      kArea: ['ideal building area', 'luas bangunan ideal'],
      kCost: ['building cost', 'biaya bangunan'],
      kCost2: ['estimated building cost', 'perkiraan biaya bangunan'],
      kFloors: ['floors', 'jumlah lantai'],
      kScore: ['fit score', 'skor kesesuaian'],
      lock: ['unlocks with your details', 'terbuka setelah Anda mengisi data'],
      fName: ['name', 'nama'], pName: ['your name', 'nama Anda'],
      fWa: ['whatsapp number', 'nomor whatsapp'],
      fEmail: ['email (optional)', 'email (opsional)'],
      open: ['open full results', 'buka hasil lengkap'],
      consent: ['i agree that tings may store my details and contact me about this project.', 'saya setuju tings menyimpan data saya dan menghubungi saya terkait proyek ini.'],
      fine: ['we’ll only use your details to follow up on this project. no spam, ever.', 'data Anda hanya kami gunakan untuk menindaklanjuti proyek ini. tanpa spam.'],
      full: ['full results', 'hasil lengkap'],
      bCats: ['fit score by category', 'skor per kategori'],
      bZones: ['area by category', 'luas per kategori'],
      bTiers: ['cost by finish quality', 'biaya per kualitas material'],
      bRecs: ['recommendations', 'rekomendasi'],
      ctaT: ['let’s turn these numbers into a plan.', 'mari ubah angka ini menjadi rencana.'],
      ctaWa: ['send this to us on whatsapp', 'kirim ke kami lewat whatsapp'],
      restart: ['start over', 'mulai lagi'],
      back: ['back', 'kembali']
    };
    var o = {};
    Object.keys(T).forEach(function (k) { o[k] = T[k][id ? 1 : 0]; });
    return o;
  }
  rates() { return { standard: [4, 5], mid: [5, 6.5], premium: [6.5, 8] }; }
  qLabel(q) { return { standard: this.L('standard', 'standar'), mid: this.L('mid', 'menengah'), premium: 'premium' }[q]; }
  regions() {
    return [
      { id: 'yogyakarta', label: 'yogyakarta', f: 1.0 },
      { id: 'cjava', label: this.L('central java', 'jawa tengah'), f: 0.97 },
      { id: 'ejava', label: this.L('east java', 'jawa timur'), f: 1.0 },
      { id: 'jabodetabek', label: 'jabodetabek', f: 1.18 },
      { id: 'bali', label: 'bali', f: 1.12 },
      { id: 'buton', label: 'buton / sultra', f: 1.12 },
      { id: 'other', label: this.L('other', 'lainnya'), f: 1.05 }
    ];
  }
  typeList() {
    return [
      { id: 'house', title: this.L('house', 'rumah tinggal'), desc: this.L('a home for your family, from a first house to a forever one.', 'rumah untuk keluarga, dari rumah pertama sampai rumah untuk selamanya.') },
      { id: 'cafe', title: this.L('café or bakeshop', 'kafe atau toko roti'), desc: this.L('a place to serve, sell and gather.', 'tempat untuk menyajikan, berjualan, dan berkumpul.') },
      { id: 'stay', title: this.L('boarding house or villa', 'kos atau vila'), desc: this.L('rooms to rent, for students, workers or travellers.', 'kamar untuk disewakan, bagi mahasiswa, pekerja, atau wisatawan.') },
      { id: 'clinic', title: this.L('clinic', 'klinik'), desc: this.L('general, dental or aesthetic practice.', 'klinik umum, gigi, atau kecantikan.') }
    ];
  }
  // ---------- area model ----------
  roomsFor(type, a) {
    var self = this, L = function (e, i) { return self.L(e, i); };
    var R = [];
    var add = function (name, area, zone) { if (area > 0) { R.push({ name: name, area: area, zone: zone }); } };
    var circ = 0.25, outdoor = 0, extra = {};
    if (type === 'house') {
      var P = a.adults + a.kids + a.elderly;
      add(L('master bedroom', 'kamar tidur utama'), 16, 'private');
      if (a.bedrooms > 1) { add((a.bedrooms - 1) + L(' bedroom' + (a.bedrooms > 2 ? 's' : ''), ' kamar tidur') + ' (3×4 m)', (a.bedrooms - 1) * 12, 'private'); }
      var baths = a.bathrooms, bathArea = 0;
      if (a.ensuite === 'yes' && baths > 0) { bathArea += 5; baths -= 1; }
      bathArea += baths * 4;
      add(a.bathrooms + L(' bathroom' + (a.bathrooms > 1 ? 's' : ''), ' kamar mandi'), bathArea, 'service');
      add(L('living room', 'ruang tamu'), 12 + Math.max(0, P - 4) * 1.5, 'public');
      add(L('family room', 'ruang keluarga'), 14 + Math.max(0, P - 4) * 1.5, 'public');
      add(L('dining', 'ruang makan'), 9 + Math.max(0, P - 4) * 1.2, 'public');
      if (a.kitchen === 'two') { add(L('clean kitchen', 'dapur bersih'), 8, 'service'); add(L('dirty kitchen', 'dapur kotor'), 8, 'service'); } else { add(L('kitchen', 'dapur'), 9, 'service'); }
      add(L('laundry and drying', 'cuci dan jemur'), 6, 'service');
      add(L('storage', 'gudang'), 4, 'service');
      add(L('front terrace', 'teras depan'), 6, 'terrace');
      if (a.maid === 'yes') { add(L('helper’s room + bathroom', 'kamar art + kamar mandi'), 8.5, 'service'); }
      if (a.study === 'yes') { add(L('study', 'ruang kerja'), 9, 'private'); }
      if (a.prayer === 'yes') { add(L('prayer room', 'mushola'), 4, 'private'); }
      var hob = { gym: 15, music: 12, workshop: 15, art: 12 }[a.hobby];
      if (hob) { add(this.optLabel('hobby', a.hobby) + L(' room', ''), hob, 'private'); }
      if (a.cars > 0) { add(a.cars + L('-car ', ' mobil, ') + this.optLabel('parking', a.parking), a.cars * (a.parking === 'garage' ? 18 : 15), 'parking'); }
      if (a.motors > 0) { add(a.motors + L(' motorbike' + (a.motors > 1 ? 's' : ''), ' motor'), a.motors * 2, 'parking'); }
      if (a.pool === 'yes') { outdoor += 36; }
      extra.people = P;
    } else if (type === 'cafe') {
      var seats = a.seatMode === 'seats' ? a.seats : Math.max(8, Math.ceil(a.customers / 12));
      var indoor = a.outdoor === 'yes' ? Math.round(seats * 0.7) : seats;
      var dining = indoor * 1.5;
      add(indoor + L(' indoor seats (1.5 m² each)', ' kursi dalam (1,5 m² per kursi)'), dining, 'public');
      add(a.kind === 'bakeshop' ? L('counter and cashier', 'counter dan kasir') : L('bar and cashier', 'bar dan kasir'), a.kind === 'bakeshop' ? 10 : 12, 'public');
      add(L('display', 'area display'), { none: 0, small: 6, large: 12 }[a.display], 'public');
      var k = { coffee: Math.max(9, dining * 0.15), full: Math.max(15, dining * 0.3), bakery: Math.max(25, dining * 0.35) }[a.kitchen];
      add(this.optLabel('ckitchen', a.kitchen), k, 'service');
      add(L('dry and cold storage', 'gudang kering dan dingin'), Math.max(6, dining * 0.08), 'service');
      var wc = Math.max(1, Math.ceil(seats / 25));
      add(wc + L(' toilet' + (wc > 1 ? 's' : ''), ' toilet'), wc * 3.5, 'service');
      if (a.staff === 'yes') { add(L('staff room', 'ruang staf'), 6, 'service'); }
      if (a.prayer === 'yes') { add(L('prayer room', 'mushola'), 4, 'public'); }
      if (a.outdoor === 'yes') { outdoor += (seats - indoor) * 1.5; }
      circ = 0.3;
      extra.seats = seats;
    } else if (type === 'stay') {
      var villa = a.kind === 'villa';
      var size = villa ? ({ standard: 16, large: 20, suite: 28 }[a.size] || 16) : ({ compact: 9, standard: 12, large: 16 }[a.size] || 12);
      add(a.rooms + L(' rooms (', ' kamar (') + size + L(' m² each)', ' m² per kamar)'), a.rooms * size, 'private');
      if (a.bath === 'ensuite') { add(a.rooms + L(' en-suite bathrooms', ' kamar mandi dalam'), a.rooms * (villa ? 4.5 : 3), 'private'); }
      else { var sb = Math.max(1, Math.ceil(a.rooms / 4)); add(sb + L(' shared bathroom' + (sb > 1 ? 's' : ''), ' kamar mandi bersama'), sb * 3.5, 'service'); }
      if (villa) { add(L('reception', 'resepsionis'), 6, 'public'); add(L('lobby and lounge', 'lobi dan lounge'), 16 + a.rooms, 'public'); add(L('kitchen', 'dapur'), 9, 'service'); }
      else { if (a.common === 'yes') { add(L('common lounge', 'ruang bersama'), 12, 'public'); } add(L('shared pantry', 'pantry bersama'), 6 + a.rooms * 0.4, 'service'); }
      add(L('laundry', 'ruang cuci'), 6, 'service');
      if (a.caretaker === 'yes') { add(L('caretaker room + bathroom', 'kamar penjaga + kamar mandi'), 12, 'service'); }
      if (a.parking === 'yes') { add(a.rooms + L(' motorbike bays', ' tempat parkir motor'), a.rooms * 1.5, 'parking'); }
      circ = 0.28;
      extra.size = size; extra.min = villa ? 16 : 9;
    } else if (type === 'clinic') {
      var pr = { general: 12, dental: 16, aesthetic: 12 }[a.kind];
      var tr = { general: 15, dental: 16, aesthetic: 12 }[a.kind];
      add(L('registration and admin', 'pendaftaran dan admin'), 9, 'public');
      add(L('waiting area', 'ruang tunggu'), Math.max(12, (a.practice + a.treatment) * 5 * 1.5), 'public');
      add(a.practice + L(' consultation room' + (a.practice > 1 ? 's' : ''), ' ruang praktik'), a.practice * pr, 'private');
      if (a.treatment > 0) { add(a.treatment + L(' treatment room' + (a.treatment > 1 ? 's' : ''), ' ruang tindakan'), a.treatment * tr, 'private'); }
      if (a.pharmacy === 'yes') { add(L('pharmacy', 'apotek'), 9, 'service'); }
      if (a.lab === 'yes') { add(L('laboratory', 'laboratorium'), 12, 'service'); }
      add(L('sterilisation', 'sterilisasi'), 6, 'service');
      add(L('staff room', 'ruang staf'), 9, 'service');
      add(L('storage and medical waste', 'gudang dan limbah medis'), 6, 'service');
      add(L('toilets (incl. 1 accessible)', 'toilet (termasuk 1 difabel)'), 10.5, 'service');
      if (a.prayer === 'yes') { add(L('prayer room', 'mushola'), 4, 'public'); }
      circ = 0.35;
    }
    return { rooms: R, circ: circ, outdoor: outdoor, extra: extra };
  }
  compute(st, overrideA) {
    var type = st.type || 'house';
    var a = overrideA || st.a[type];
    var m = this.roomsFor(type, a);
    var net = 0, parking = 0, zones = { private: 0, public: 0, service: 0, terrace: 0, parking: 0 };
    m.rooms.forEach(function (r) { zones[r.zone] += r.area; if (r.zone === 'parking' || r.zone === 'terrace') { parking += r.area; } else { net += r.area; } });
    var circArea = net * m.circ;
    var land = parseFloat(st.land) || 0;
    var maxFoot = land * 0.6;
    var core = net + circArea;
    var floors;
    if (st.floors !== 'auto') { floors = parseInt(st.floors, 10); }
    else if (land > 0) { floors = Math.max(1, Math.min(4, Math.ceil((core + parking) / Math.max(1, maxFoot)))); }
    else { floors = core > 220 ? 2 : 1; }
    var stairs = (floors - 1) * 8;
    return { type: type, a: a, rooms: m.rooms, zones: zones, net: net, circ: Math.round(circArea + stairs), parking: parking, core: core + stairs,
      gross: Math.round(core + stairs + parking), floors: floors, footprint: Math.round((core + stairs) / floors + parking), land: land, maxFoot: maxFoot, outdoor: m.outdoor, extra: m.extra };
  }
  costOf(c, tier, f) {
    var r = this.rates()[tier];
    var eq = c.core + c.parking * 0.5;
    return [eq * r[0] * f, eq * r[1] * f];
  }
  num(jt) {
    var id = this.state.lang === 'id';
    if (jt >= 1000) { return (Math.round(jt / 10) / 100).toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', id ? ',' : '.') + (id ? ' m' : ' bn'); }
    return Math.round(jt / 10) * 10 + (id ? ' jt' : ' mn');
  }
  fmt(jt) { return 'rp ' + this.num(jt); }
  fmtRange(r) {
    var a = this.num(r[0]), b = this.num(r[1]);
    var sa = a.split(' '), sb = b.split(' ');
    if (sa[1] === sb[1]) { return 'rp ' + sa[0] + '–' + b; }
    return 'rp ' + a + ' – ' + b;
  }
  fitsBudget(st, budget, f) {
    var self = this, type = st.type || 'house';
    var base = JSON.parse(JSON.stringify(st.a[type]));
    var key = { house: 'bedrooms', cafe: 'seats', stay: 'rooms', clinic: 'practice' }[type];
    var steps = { house: [1, 2, 3, 4, 5, 6], cafe: [10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120], stay: [4, 6, 8, 10, 12, 15, 18, 20, 25, 30, 40], clinic: [1, 2, 3, 4, 5, 6, 8] }[type];
    if (type === 'cafe') { base.seatMode = 'seats'; }
    var best = null;
    steps.forEach(function (v) {
      var a = JSON.parse(JSON.stringify(base)); a[key] = v;
      if (type === 'house') { a.bathrooms = Math.max(1, Math.ceil(v / 2) + (v > 2 ? 1 : 0)); }
      var c = self.compute(st, a);
      var cr = self.costOf(c, st.quality, f);
      if ((cr[0] + cr[1]) / 2 <= budget) { best = { v: v, c: c }; }
    });
    if (!best) { return null; }
    var lab = {
      house: self.L('about a ' + best.v + '-bedroom house', 'kira-kira rumah ' + best.v + ' kamar tidur'),
      cafe: self.L('about a ' + best.v + '-seat café', 'kira-kira kafe ' + best.v + ' kursi'),
      stay: self.L('about ' + best.v + ' rental rooms', 'kira-kira ' + best.v + ' kamar sewa'),
      clinic: self.L('about a clinic with ' + best.v + ' consultation rooms', 'kira-kira klinik dengan ' + best.v + ' ruang praktik')
    }[type];
    return { label: lab, c: best.c };
  }
  // ---------- questions ----------
  opts() {
    var L = this.L.bind(this);
    return {
      yn: [['yes', L('yes', 'ya')], ['no', L('no', 'tidak')]],
      parking: [['carport', 'carport'], ['garage', L('garage', 'garasi')]],
      kitchen: [['one', L('one kitchen', 'satu dapur')], ['two', L('clean + dirty', 'bersih + kotor')]],
      hobby: [['none', L('none', 'tidak ada')], ['gym', 'gym'], ['music', L('music', 'musik')], ['workshop', 'workshop'], ['art', L('art studio', 'studio seni')]],
      ckind: [['cafe', L('café', 'kafe')], ['bakeshop', L('bakeshop', 'toko roti')]],
      seatMode: [['seats', L('number of seats', 'jumlah kursi')], ['customers', L('customers a day', 'pelanggan per hari')]],
      ckitchen: [['coffee', L('coffee bar', 'coffee bar')], ['full', L('full kitchen', 'dapur lengkap')], ['bakery', L('bakery production', 'produksi roti')]],
      display: [['none', L('none', 'tidak ada')], ['small', L('small', 'kecil')], ['large', L('large', 'besar')]],
      skind: [['kos', L('boarding house', 'kos')], ['villa', L('villa', 'vila')]],
      ksize: [['compact', L('compact', 'kecil')], ['standard', L('standard', 'standar')], ['large', L('large', 'besar')]],
      vsize: [['standard', L('standard', 'standar')], ['large', L('large', 'besar')], ['suite', 'suite']],
      bath: [['ensuite', L('en-suite', 'kamar mandi dalam')], ['shared', L('shared', 'bersama')]],
      clkind: [['general', L('general', 'umum')], ['dental', L('dental', 'gigi')], ['aesthetic', L('aesthetic', 'kecantikan')]],
      floors: [['auto', 'auto'], ['1', '1'], ['2', '2'], ['3', '3']],
      quality: [['standard', L('standard', 'standar')], ['mid', L('mid', 'menengah')], ['premium', 'premium']]
    };
  }
  optLabel(set, id) { var o = this.opts()[set] || []; for (var i = 0; i < o.length; i++) { if (o[i][0] === id) { return o[i][1]; } } return id; }
  setA(type, key, val) {
    var a = JSON.parse(JSON.stringify(this.state.a));
    a[type][key] = val;
    this.setState({ a: a });
  }
  stepperQ(type, key, label, hint, min, max, inc) {
    var self = this, v = this.state.a[type][key], d = inc || 1;
    return { label: label, hint: hint, isStepper: true, isChoice: false, isInput: false, value: v,
      dec: function () { self.setA(type, key, Math.max(min, self.state.a[type][key] - d)); },
      inc: function () { self.setA(type, key, Math.min(max, self.state.a[type][key] + d)); } };
  }
  choiceQ(type, key, label, hint, opts) {
    var self = this, v = type ? this.state.a[type][key] : this.state[key];
    return { label: label, hint: hint, isStepper: false, isChoice: true, isInput: false,
      options: opts.map(function (o) {
        var id = o[0];
        return { label: o[1], cls: v === id ? 'chip on' : 'chip', on: v === id ? 'true' : 'false',
          pick: function () { if (type) { self.setA(type, key, id); } else { var u = {}; u[key] = id; self.setState(u); } } };
      }) };
  }
  inputQ(key, label, hint, unit, ph) {
    var self = this;
    return { label: label, hint: hint, isStepper: false, isChoice: false, isInput: true, value: this.state[key], unit: unit, ph: ph,
      set: function (e) { var u = {}; u[key] = String(e.target.value).replace(/[^0-9]/g, ''); self.setState(u); } };
  }
  needsQs() {
    var t = this.state.type, a = this.state.a[t], Q = [], O = this.opts(), L = this.L.bind(this);
    if (t === 'house') {
      Q.push(this.stepperQ(t, 'adults', L('adults', 'orang dewasa'), L('people living in the house', 'yang tinggal di rumah'), 1, 10));
      Q.push(this.stepperQ(t, 'kids', L('children', 'anak-anak'), '', 0, 8));
      Q.push(this.stepperQ(t, 'elderly', L('elderly family members', 'anggota keluarga lansia'), L('we’ll keep a bedroom on the ground floor', 'kami siapkan kamar di lantai dasar'), 0, 4));
      Q.push(this.stepperQ(t, 'bedrooms', L('bedrooms', 'kamar tidur'), L('including the master bedroom', 'termasuk kamar tidur utama'), 1, 8));
      Q.push(this.stepperQ(t, 'bathrooms', L('bathrooms', 'kamar mandi'), '', 1, 8));
      Q.push(this.choiceQ(t, 'ensuite', L('en-suite in the master bedroom?', 'kamar mandi dalam di kamar utama?'), '', O.yn));
      Q.push(this.stepperQ(t, 'cars', L('cars', 'mobil'), '', 0, 4));
      if (a.cars > 0) { Q.push(this.choiceQ(t, 'parking', L('carport or garage?', 'carport atau garasi?'), L('a carport is open, a garage is enclosed', 'carport terbuka, garasi tertutup'), O.parking)); }
      Q.push(this.stepperQ(t, 'motors', L('motorbikes', 'motor'), '', 0, 6));
      Q.push(this.choiceQ(t, 'kitchen', L('kitchens', 'dapur'), L('a clean kitchen for show, a dirty one for real cooking', 'dapur bersih untuk tampilan, dapur kotor untuk memasak'), O.kitchen));
      Q.push(this.choiceQ(t, 'maid', L('room for a live-in helper?', 'kamar asisten rumah tangga?'), '', O.yn));
      Q.push(this.choiceQ(t, 'study', L('a study or home office?', 'ruang kerja?'), '', O.yn));
      Q.push(this.choiceQ(t, 'prayer', L('a prayer room?', 'mushola?'), '', O.yn));
      Q.push(this.choiceQ(t, 'hobby', L('a room for a hobby?', 'ruang untuk hobi?'), '', O.hobby));
      Q.push(this.choiceQ(t, 'pool', L('a swimming pool?', 'kolam renang?'), L('needs open land, outside the building', 'butuh lahan terbuka di luar bangunan'), O.yn));
    } else if (t === 'cafe') {
      Q.push(this.choiceQ(t, 'kind', L('what kind?', 'jenisnya?'), '', O.ckind));
      Q.push(this.choiceQ(t, 'seatMode', L('what do you know best?', 'yang paling Anda ketahui?'), '', O.seatMode));
      if (a.seatMode === 'seats') { Q.push(this.stepperQ(t, 'seats', L('seats', 'jumlah kursi'), L('1 m² per seat plus 0.5 m² for access', '1 m² per kursi ditambah 0,5 m² untuk akses'), 6, 200, 2)); }
      else { Q.push(this.stepperQ(t, 'customers', L('customers a day', 'pelanggan per hari'), L('we estimate seats from about 8 busy hours and 1.5 turns an hour', 'kursi dihitung dari sekitar 8 jam ramai dan 1,5 kali pergantian per jam'), 20, 1500, 10)); }
      Q.push(this.choiceQ(t, 'kitchen', L('kitchen type', 'tipe dapur'), '', O.ckitchen));
      Q.push(this.choiceQ(t, 'display', L('display area', 'area display'), L('for cakes, bread or retail', 'untuk kue, roti, atau barang jualan'), O.display));
      Q.push(this.choiceQ(t, 'outdoor', L('some outdoor seating?', 'ada area duduk outdoor?'), L('we’ll move about 30% of seats outside', 'sekitar 30% kursi dipindah ke luar'), O.yn));
      Q.push(this.choiceQ(t, 'staff', L('a staff room?', 'ruang staf?'), '', O.yn));
      Q.push(this.choiceQ(t, 'prayer', L('a prayer room?', 'mushola?'), '', O.yn));
    } else if (t === 'stay') {
      var villa = a.kind === 'villa';
      Q.push(this.choiceQ(t, 'kind', L('boarding house or villa?', 'kos atau vila?'), '', O.skind));
      Q.push(this.stepperQ(t, 'rooms', L('number of rooms', 'jumlah kamar'), '', 2, 60));
      Q.push(this.choiceQ(t, 'size', L('room size', 'ukuran kamar'), villa ? L('standard 16 m², large 20 m², suite 28 m²', 'standar 16 m², besar 20 m², suite 28 m²') : L('compact 3×3 m, standard 3×4 m, large 4×4 m', 'kecil 3×3 m, standar 3×4 m, besar 4×4 m'), villa ? O.vsize : O.ksize));
      Q.push(this.choiceQ(t, 'bath', L('bathrooms', 'kamar mandi'), '', O.bath));
      if (!villa) { Q.push(this.choiceQ(t, 'common', L('a common lounge?', 'ruang bersama?'), '', O.yn)); }
      Q.push(this.choiceQ(t, 'caretaker', L('a caretaker’s room?', 'kamar penjaga?'), '', O.yn));
      Q.push(this.choiceQ(t, 'parking', L('covered motorbike parking?', 'parkir motor beratap?'), L('one bay per room', 'satu tempat per kamar'), O.yn));
    } else if (t === 'clinic') {
      Q.push(this.choiceQ(t, 'kind', L('type of clinic', 'jenis klinik'), '', O.clkind));
      Q.push(this.stepperQ(t, 'practice', L('consultation rooms', 'ruang praktik'), '', 1, 12));
      Q.push(this.stepperQ(t, 'treatment', L('treatment rooms', 'ruang tindakan'), '', 0, 12));
      Q.push(this.choiceQ(t, 'pharmacy', L('a pharmacy?', 'apotek?'), '', O.yn));
      Q.push(this.choiceQ(t, 'lab', L('a laboratory?', 'laboratorium?'), '', O.yn));
      Q.push(this.choiceQ(t, 'prayer', L('a prayer room?', 'mushola?'), '', O.yn));
    }
    return Q;
  }
  siteQs() {
    var Q = [], O = this.opts(), L = this.L.bind(this);
    var regs = this.regions().map(function (r) { return [r.id, r.label]; });
    var unitB = L('million rp', 'juta rp');
    if (this.state.mode === 'budget') { Q.push(this.inputQ('budget', L('your building budget', 'budget bangunan Anda'), L('for the building only, without land', 'untuk bangunan saja, di luar tanah'), unitB, L('e.g. 800', 'mis. 800'))); }
    Q.push(this.inputQ('land', L('land size', 'luas tanah'), L('optional, helps us check what fits', 'opsional, untuk mengecek apa saja yang muat'), 'm²', L('e.g. 200', 'mis. 200')));
    Q.push(this.choiceQ(null, 'floors', L('floors', 'jumlah lantai'), L('auto picks the fewest floors that fit', 'auto memilih jumlah lantai paling sedikit yang muat'), O.floors));
    Q.push(this.choiceQ(null, 'quality', L('finish quality', 'kualitas material'), L('standard 4–5, mid 5–6.5, premium 6.5–8 million rp per m²', 'standar 4–5, menengah 5–6,5, premium 6,5–8 juta rp per m²'), O.quality));
    Q.push(this.choiceQ(null, 'loc', L('location', 'lokasi'), '', regs));
    if (this.state.mode === 'needs') { Q.push(this.inputQ('budget', L('your budget, if you have one', 'budget Anda, jika ada'), L('optional, we’ll check how it compares', 'opsional, untuk kami bandingkan'), unitB, L('e.g. 800', 'mis. 800'))); }
    return Q;
  }
  // ---------- results ----------
  results() {
    var st = this.state, self = this, L = this.L.bind(this);
    var reg = this.regions().filter(function (r) { return r.id === st.loc; })[0] || this.regions()[0];
    var f = reg.f, ql = this.qLabel(st.quality);
    var budget = parseFloat(st.budget) || 0;
    var c = this.compute(st);
    var fit = null;
    if (st.mode === 'budget' && budget > 0) { fit = this.fitsBudget(st, budget, f); if (fit) { c = fit.c; } }
    var cost = this.costOf(c, st.quality, f), mid = (cost[0] + cost[1]) / 2;
    var cats = [], recs = [];
    var comfort = 100, cnote = '';
    if (c.type === 'house') {
      var a = c.a, per = c.core / Math.max(1, c.extra.people);
      comfort = Math.min(100, Math.round(per / 9 * 100 * 0.75));
      cnote = L(Math.round(per) + ' m² per person; sni housing guidance is at least 9 m²', Math.round(per) + ' m² per orang; acuan sni perumahan minimal 9 m²');
      if ((a.adults + a.kids + a.elderly) / a.bedrooms > 2.2) { comfort -= 15; recs.push(L('more than two people per bedroom. consider one more bedroom, or a bunk room for the kids.', 'lebih dari dua orang per kamar. pertimbangkan satu kamar tambahan, atau kamar tingkat untuk anak-anak.')); }
      if (a.bathrooms < Math.ceil(a.bedrooms / 2)) { comfort -= 10; recs.push(L('one bathroom for every two bedrooms keeps busy mornings calm. consider adding one.', 'satu kamar mandi untuk setiap dua kamar tidur membuat pagi hari lebih tenang. pertimbangkan menambah satu.')); }
      if (a.elderly > 0) { recs.push(L('keep one bedroom and an accessible bathroom on the ground floor for your elderly family members.', 'siapkan satu kamar tidur dan kamar mandi yang mudah diakses di lantai dasar untuk anggota keluarga lansia.')); }
      if (a.pool === 'yes') { recs.push(L('a pool needs about 36 m² of open land (3×8 m plus a deck), outside the building area. its cost isn’t included here.', 'kolam renang butuh sekitar 36 m² lahan terbuka (3×8 m plus dek), di luar luas bangunan. biayanya belum termasuk di sini.')); }
      if (a.kitchen === 'two') { recs.push(L('place the dirty kitchen next to the laundry and service entrance so cooking smells stay out of the house.', 'letakkan dapur kotor dekat area cuci dan pintu servis supaya bau masakan tidak masuk ke rumah.')); }
    } else if (c.type === 'cafe') {
      var seats = c.extra.seats, wcs = Math.max(1, Math.ceil(seats / 25));
      comfort = 92; cnote = L(seats + ' seats at 1.5 m² each, with ' + wcs + ' toilet(s)', seats + ' kursi @1,5 m², dengan ' + wcs + ' toilet');
      if (c.a.seatMode === 'customers') { recs.push(L(c.a.customers + ' customers a day works out to about ' + seats + ' seats.', c.a.customers + ' pelanggan per hari setara sekitar ' + seats + ' kursi.')); }
      recs.push(L('plan space outside for about ' + Math.ceil(seats * 0.6) + ' motorbikes. parking decides more visits than the menu does.', 'siapkan parkir untuk sekitar ' + Math.ceil(seats * 0.6) + ' motor. parkir sering lebih menentukan kunjungan daripada menu.'));
      if (c.a.kitchen !== 'coffee') { recs.push(L('give the kitchen its own exhaust and a back entrance for deliveries and waste.', 'beri dapur exhaust sendiri dan pintu belakang untuk barang masuk dan sampah.')); }
      if (c.a.display !== 'none') { recs.push(L('put the display where people can see it from the street. it does half the selling.', 'letakkan display di tempat yang terlihat dari jalan. setengah penjualan terjadi di sana.')); }
    } else if (c.type === 'stay') {
      comfort = c.extra.size >= c.extra.min ? 95 : 70;
      cnote = L(c.extra.size + ' m² rooms; common minimum is ' + c.extra.min + ' m²', 'kamar ' + c.extra.size + ' m²; minimum umum ' + c.extra.min + ' m²');
      if (c.a.bath === 'shared') { recs.push(L('en-suite rooms usually rent for more and fill faster. compare both before you decide.', 'kamar dengan kamar mandi dalam biasanya lebih mahal dan lebih cepat terisi. bandingkan keduanya sebelum memutuskan.')); }
      recs.push(L('a single-loaded corridor costs a little more area but gives every room a window and cross ventilation.', 'koridor satu sisi butuh sedikit lebih banyak luas, tapi setiap kamar dapat jendela dan ventilasi silang.'));
    } else if (c.type === 'clinic') {
      comfort = 90; cnote = L('standard room sizes for a ' + this.optLabel('clkind', c.a.kind) + ' clinic', 'ukuran ruang standar untuk klinik ' + this.optLabel('clkind', c.a.kind));
      recs.push(L('check room requirements against the latest ministry of health regulation for your clinic type before applying for permits.', 'cek kebutuhan ruang dengan peraturan kemenkes terbaru untuk jenis klinik Anda sebelum mengurus izin.'));
      recs.push(L('separate clean and dirty flows, from sterilisation to waste, early in the plan.', 'pisahkan alur bersih dan kotor, dari sterilisasi sampai limbah, sejak awal perencanaan.'));
    }
    comfort = Math.max(0, Math.min(100, comfort));
    cats.push({ label: L('space comfort', 'kenyamanan ruang'), score: comfort, note: cnote });
    if (c.land > 0) {
      var avail = c.maxFoot;
      var ls = c.footprint <= avail ? 100 : Math.round(avail / c.footprint * 100);
      if (c.outdoor > 0 && c.land - c.footprint < c.outdoor) { ls = Math.min(ls, 70); }
      cats.push({ label: L('land fit', 'kecocokan lahan'), score: ls, note: L('footprint ' + c.footprint + ' m² of ' + Math.round(avail) + ' m² allowed (60% building coverage)', 'tapak ' + c.footprint + ' m² dari ' + Math.round(avail) + ' m² yang diizinkan (kdb 60%)') });
      if (ls < 100) { recs.push(L('the footprint is larger than 60% of your land. add a floor or trim the program to stay within typical building coverage rules.', 'tapak bangunan melebihi 60% luas tanah. tambah lantai atau kurangi kebutuhan ruang agar sesuai aturan kdb pada umumnya.')); }
      else { recs.push(L('with ' + c.land + ' m² of land, ' + c.floors + ' floor' + (c.floors > 1 ? 's fit' : ' fits') + ' comfortably, with a ground floor of about ' + c.footprint + ' m².', 'dengan tanah ' + c.land + ' m², ' + c.floors + ' lantai sudah cukup lega, dengan lantai dasar sekitar ' + c.footprint + ' m².')); }
    } else {
      cats.push({ label: L('land fit', 'kecocokan lahan'), score: null, note: L('add your land size to check this', 'isi luas tanah untuk mengecek ini') });
      recs.push(L('add your land size and we can check whether this fits on one floor or needs two.', 'isi luas tanah supaya kami bisa mengecek apakah cukup satu lantai atau perlu dua.'));
    }
    if (budget > 0) {
      cats.push({ label: L('budget fit', 'kecocokan budget'), score: Math.min(100, Math.round(budget / mid * 100)), note: L(this.fmt(budget) + ' against about ' + this.fmt(mid), this.fmt(budget) + ' dibanding sekitar ' + this.fmt(mid)) });
      if (st.mode === 'needs') {
        if (budget < cost[0]) {
          var rr = this.rates()[st.quality];
          var area = Math.round(budget / (((rr[0] + rr[1]) / 2) * f)), areaStd = Math.round(budget / (4.5 * f));
          recs.unshift(L('your budget covers about ' + area + ' m² at ' + ql + ' finishes. lock the budget and trim to that size, or choose standard finishes for about ' + areaStd + ' m².', 'budget Anda cukup untuk sekitar ' + area + ' m² dengan kualitas ' + ql + '. kunci budget dan sesuaikan luasnya, atau pilih kualitas standar untuk sekitar ' + areaStd + ' m².'));
        } else if (budget > cost[1]) {
          recs.unshift(L('your budget leaves about ' + this.fmt(budget - cost[1]) + ' for landscaping, furniture or a contingency.', 'budget Anda masih menyisakan sekitar ' + this.fmt(budget - cost[1]) + ' untuk taman, furnitur, atau dana cadangan.'));
        } else {
          recs.unshift(L('your budget sits inside the estimated range. keep a 10% contingency on top.', 'budget Anda masuk dalam rentang perkiraan. siapkan dana cadangan 10% di luar itu.'));
        }
      }
    } else {
      cats.push({ label: L('budget fit', 'kecocokan budget'), score: null, note: L('add a budget to compare', 'isi budget untuk membandingkan') });
    }
    if (st.mode === 'budget') {
      if (fit) { recs.unshift(L('with ' + this.fmt(budget) + ' at ' + ql + ' finishes, you can build about ' + c.gross + ' m²: ' + fit.label + '.', 'dengan ' + this.fmt(budget) + ' dan kualitas ' + ql + ', Anda bisa membangun sekitar ' + c.gross + ' m²: ' + fit.label + '.')); }
      else { recs.unshift(L('this budget is below the smallest typical layout at ' + ql + ' finishes. try standard finishes, or talk to us about building in phases.', 'budget ini di bawah denah terkecil untuk kualitas ' + ql + '. coba kualitas standar, atau diskusikan dengan kami soal membangun bertahap.')); }
    }
    recs.push(L('next step: a free discussion. we’ll turn these numbers into a zoning plan for your site.', 'langkah berikutnya: diskusi gratis. kami ubah angka ini menjadi rencana zoning untuk lahan Anda.'));
    var scored = cats.filter(function (x) { return x.score !== null; });
    var score = Math.round(scored.reduce(function (s, x) { return s + x.score; }, 0) / scored.length);
    var zoneLabels = [['private', L('private', 'privat')], ['public', L('shared and public', 'bersama dan publik')], ['service', L('service', 'servis')], ['parking', L('parking', 'parkir')], ['terrace', L('terrace', 'teras')]];
    var zl = zoneLabels.map(function (z) { return { label: z[1], v: c.zones[z[0]] }; }).filter(function (z) { return z.v > 0; });
    zl.push({ label: L('circulation and stairs', 'sirkulasi dan tangga'), v: c.circ });
    var maxZ = Math.max.apply(null, zl.map(function (z) { return z.v; }));
    var tiers = ['standard', 'mid', 'premium'].map(function (t) {
      var r = self.rates()[t];
      return { label: self.qLabel(t), range: self.fmtRange(self.costOf(c, t, f)), rate: (self.state.lang === 'id' ? String(r[0]).replace('.', ',') + '–' + String(r[1]).replace('.', ',') + ' juta rp per m² × ' : r[0] + '–' + r[1] + ' million rp per m² × ') + f.toFixed(2), cls: t === st.quality ? 'tier on' : 'tier' };
    });
    return { c: c, cost: cost, f: f, reg: reg, ql: ql, cats: cats, score: score, recs: recs, zones: zl, maxZ: maxZ, tiers: tiers };
  }
  sendLead() {
    var st = this.state, R = null;
    try { R = this.results(); } catch (e) {}
    var tt = (this.typeList().filter(function (t) { return t.id === st.type; })[0] || {}).title || st.type;
    var payload = {
      name: st.name, whatsapp: st.wa, email: st.email, consent: !!st.consent, company: st.hp,
      type: tt, mode: st.mode,
      area: R ? R.c.gross : '', floors: R ? R.c.floors : '',
      quality: R ? R.ql : st.quality, location: R ? R.reg.label : st.loc,
      land: st.land, budget: st.budget,
      estimate: R ? this.fmtRange(R.cost) : '', score: R ? R.score : '', lang: st.lang
    };
    try {
      fetch('https://script.google.com/macros/s/AKfycbwidrGWIIRIXUkRtJArHlGpkDx98esGDdRM_1w59jJNwgE95VlFoVIkOdB4R44LtQ5v/exec', {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) {}
  }
  go(n) { this.setState({ step: n, err: '' }); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }
  renderVals() {
    var self = this, st = this.state, L = this.L.bind(this), id = st.lang === 'id';
    var stepNames = [L('start', 'mulai'), L('building', 'bangunan'), st.mode === 'budget' ? L('site and budget', 'lahan dan budget') : L('your needs', 'kebutuhan'), L('results', 'hasil')];
    var visual = st.step <= 2 ? st.step : 3;
    var prog = stepNames.map(function (l, k) { return { label: (k + 1) + '. ' + l, cls: 'pstep' + (k < visual ? ' done' : (k === visual ? ' cur' : '')) }; });
    var sub = st.sub || 'needs';
    var onNeeds = st.step === 2 && st.mode === 'needs' && sub === 'needs';
    var onSite = st.step === 2 && (st.mode === 'budget' || sub === 'site');
    var tTitle = (this.typeList().filter(function (t) { return t.id === st.type; })[0] || {}).title || '';
    var R = (st.step >= 3 && st.type) ? this.results() : null;
    var c = R ? R.c : (st.type ? this.compute(st) : null);
    var scoreLbl = R ? (R.score >= 85 ? L('a great fit', 'sangat sesuai') : (R.score >= 65 ? L('workable, with a few trade-offs', 'bisa, dengan beberapa penyesuaian') : L('needs adjusting', 'perlu disesuaikan'))) : '';
    var waText = R ? encodeURIComponent(L('hi tings, i used plan your space: ', 'halo tings, saya sudah mencoba plan your space: ') + tTitle + ', ±' + c.gross + ' m², ' + c.floors + L(' floor(s), ', ' lantai, ') + R.ql + ', ' + R.reg.label + ', ' + this.fmtRange(R.cost) + L('. i’d like to discuss it.', '. saya ingin berdiskusi.')) : '';
    return {
      tx: this.tx(),
      toggleLang: function () { self.setState({ lang: self.state.lang === 'id' ? 'en' : 'id' }); },
      langAria: id ? 'switch to english' : 'ganti ke bahasa indonesia',
      knobX: id ? '100%' : '0%',
      enCls: id ? 'lt' : 'lt on', idCls: id ? 'lt on' : 'lt',
      prog: prog,
      s0: st.step === 0, s1: st.step === 1, s2: st.step === 2, s3: st.step === 3, s4: st.step === 4,
      modes: [
        { id: 'needs', n: 'a', title: L('start from my needs', 'mulai dari kebutuhan'), desc: L('tell us the rooms and features you want. we’ll suggest the area and the budget.', 'ceritakan ruang dan fasilitas yang Anda inginkan. kami sarankan luas dan budgetnya.') },
        { id: 'budget', n: 'b', title: L('start from my budget', 'mulai dari budget'), desc: L('tell us what you can spend. we’ll show the area it buys and what fits inside.', 'masukkan budget Anda. kami tunjukkan luas yang bisa dibangun dan apa saja yang muat.') }
      ].map(function (m) { return { n: m.n, title: m.title, desc: m.desc, cls: st.mode === m.id ? 'card on' : 'card', on: st.mode === m.id ? 'true' : 'false', pick: function () { self.setState({ mode: m.id }); } }; }),
      types: this.typeList().map(function (t) { return { title: t.title, desc: t.desc, cls: st.type === t.id ? 'card on' : 'card', on: st.type === t.id ? 'true' : 'false', pick: function () { self.setState({ type: t.id }); } }; }),
      s2title: onNeeds ? L('tell us about your ' + tTitle, 'ceritakan tentang ' + tTitle + ' Anda') : (st.mode === 'budget' ? L('your budget and site', 'budget dan lahan Anda') : L('your site and finishes', 'lahan dan kualitas material')),
      s2sub: onNeeds ? L('rough numbers are fine. every answer changes the space you need.', 'angka kira-kira sudah cukup. setiap jawaban mengubah kebutuhan ruang Anda.') : L('these decide how many floors you need and what it costs to build.', 'ini menentukan jumlah lantai dan biaya membangunnya.'),
      questions: onNeeds ? this.needsQs() : (onSite ? this.siteQs() : []),
      showNav: st.step <= 2,
      backVis: st.step === 0 ? 'hidden' : 'visible',
      nextDisabled: (st.step === 1 && !st.type) || (onSite && st.mode === 'budget' && !(parseFloat(st.budget) > 0)),
      nextLabel: onSite ? L('see my results', 'lihat hasil') : L('next', 'lanjut'),
      back: function () {
        if (st.step === 2 && st.mode === 'needs' && sub === 'site') { self.setState({ sub: 'needs' }); return; }
        self.setState({ sub: 'needs' }); self.go(Math.max(0, st.step - 1));
      },
      next: function () {
        if (st.step === 2 && st.mode === 'needs' && sub === 'needs') { self.setState({ sub: 'site' }); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} return; }
        self.go(st.step + 1);
      },
      gross: c ? c.gross : 0,
      name: st.name, wa: st.wa, email: st.email, err: st.err,
      setName: function (e) { self.setState({ name: e.target.value }); },
      setWa: function (e) { self.setState({ wa: e.target.value.replace(/[^0-9+ ]/g, '') }); },
      setHp: function (e) { self.setState({ hp: e.target.value }); },
      toggleConsent: function (e) { self.setState({ consent: !!e.target.checked }); },
      consent: !!st.consent,
      hp: st.hp,
      setEmail: function (e) { self.setState({ email: e.target.value }); },
      unlock: function () {
        var digits = (self.state.wa || '').replace(/[^0-9]/g, '');
        if (!self.state.name.trim()) { self.setState({ err: L('please add your name.', 'mohon isi nama Anda.') }); return; }
        if (digits.length < 9) { self.setState({ err: L('please add a whatsapp number we can reach.', 'mohon isi nomor whatsapp yang bisa dihubungi.') }); return; }
        if (self.state.email && self.state.email.indexOf('@') < 1) { self.setState({ err: L('that email doesn’t look right. you can also leave it empty.', 'format email belum benar. boleh juga dikosongkan.') }); return; }
        if (!self.state.consent) { self.setState({ err: L('please tick the consent box so we can contact you.', 'mohon centang persetujuan agar kami bisa menghubungi Anda.') }); return; }
        self.sendLead();
        self.go(4);
      },
      greet: L('hi ', 'halo ') + (st.name || '').trim().split(' ')[0] + L(', here’s your space plan.', ', ini rencana ruang Anda.'),
      summary: R ? tTitle + ', ' + R.reg.label + ', ' + L('finishes: ', 'kualitas: ') + R.ql + (c.land ? L(', on ' + c.land + ' m² of land', ', di atas tanah ' + c.land + ' m²') : '') + '.' : '',
      areaNote: c ? Math.round(c.core) + L(' m² enclosed', ' m² ruang tertutup') + (c.parking ? ' + ' + Math.round(c.parking) + L(' m² parking and terrace', ' m² parkir dan teras') : '') : '',
      costRange: R ? this.fmtRange(R.cost) : '',
      costNote: R ? L(R.ql + ' finishes, building only', 'kualitas ' + R.ql + ', bangunan saja') : '',
      floors: c ? c.floors : '',
      floorNote: c ? L('ground floor about ' + c.footprint + ' m²', 'lantai dasar sekitar ' + c.footprint + ' m²') : '',
      score: R ? R.score + ' / 100' : '',
      scoreNote: scoreLbl,
      cats: R ? R.cats.map(function (x) { return { label: x.label, val: x.score === null ? '—' : x.score, w: (x.score === null ? 0 : x.score) + '%', cls: x.score !== null && x.score < 65 ? 'fill muted' : 'fill', note: x.note }; }) : [],
      zones: R ? R.zones.map(function (z) { return { label: z.label, val: Math.round(z.v), w: Math.round(z.v / R.maxZ * 100) + '%' }; }) : [],
      rooms: R ? R.c.rooms.map(function (r) { return { name: r.name, area: Math.round(r.area) }; }) : [],
      tiers: R ? R.tiers : [],
      recs: R ? R.recs : [],
      note: R ? L('a rough guide, not a quote. building cost covers the structure and finishes of the building only, with a ' + R.reg.label + ' price factor of ' + R.f.toFixed(2) + '. it excludes land, permits, design fees, furniture, landscaping and pools. covered parking and terraces are costed at half rate. room sizes follow common planning references (neufert, sni 03-1733-2004 for housing) and should be checked against current regulations for your building type. regional factors are placeholders until checked against local ahsp.',
        'perkiraan kasar, bukan penawaran harga. biaya bangunan mencakup struktur dan finishing bangunan saja, dengan faktor harga ' + R.reg.label + ' sebesar ' + R.f.toFixed(2).replace('.', ',') + '. belum termasuk tanah, perizinan, biaya desain, furnitur, taman, dan kolam renang. carport dan teras dihitung setengah harga. ukuran ruang mengikuti acuan perencanaan umum (neufert, sni 03-1733-2004 untuk perumahan) dan perlu dicek dengan regulasi terbaru untuk jenis bangunan Anda. faktor daerah masih sementara sampai dicek dengan ahsp setempat.') : '',
      waLink: 'https://wa.me/628985111208?text=' + waText,
      restart: function () { var f = self.fresh(); f.name = self.state.name; f.wa = self.state.wa; f.email = self.state.email; f.consent = self.state.consent; f.lang = self.state.lang; self.setState(f); self.go(0); }
    };
  }
}

window.mountDC(document.getElementById('app'), Component, document.getElementById('tpl'));
})();
