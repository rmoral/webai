(function () {
  const TOOLS = [['humanize', 'Humanizador'], ['detect', 'Detector de IA'], ['paraphrase', 'Parafraseador'], ['correct', 'Corrector']];
  const PLACEHOLDER = 'Pega aquí el texto que quieras trabajar. El contador de abajo te dice cuánto cabe.';
  const ES = 'Entiende el español de España y de América. No traduce ni pasa por el inglés.';
  const header = (d) => d
    ? `<header class="hd"><div class="wrap"><a class="logo" href="#"><span class="mark">X</span><span class="word">Verbaly<i>x</i></span></a><a class="navl" href="#">Precios</a><span class="lang"><span class="on">ES</span>/<span>EN</span></span><a class="btn btn-sm btn-ghost" href="#">Entrar</a><a class="btn btn-sm btn-fill" href="#">Crear cuenta gratis</a></div></header>`
    : `<div class="hd"><a class="logo" href="#"><span class="mark">X</span><span class="word">Verbaly<i>x</i></span></a><a class="btn btn-sm btn-fill" href="#">Crear cuenta</a><button class="burger" aria-label="Menú"><i></i></button></div>`;
  const tabs = (key, d) => `<nav class="tt"><div class="in${d ? ' wrap' : ''}">${TOOLS.map(([k, n]) => `<a class="${k === key ? 'on' : ''}" href="#">${n}</a>`).join('')}</div></nav>`;
  const title = (c, d) => `<h1 class="h1">${c.h1}</h1><p class="es">${ES}</p>${d ? `<p class="intro">${c.intro}</p>` : ''}`;
  const below = (c) => `<p class="prices">${c.priceLine} → <a href="#">Ver planes</a></p><div class="sp">Prueba social: pendiente de decisión</div><div class="rest">Resto de la landing sin cambios (${c.restLabel} · FAQ · pie)</div><div style="height:28px"></div>`;
  const cookies = `<div class="ck"><p>Cookies técnicas, siempre. Las de analítica y publicidad, solo si aceptas; rechazarlas no cambia nada. <a href="#">Política</a></p><div class="row"><button class="btn">Rechazar</button><button class="btn">Aceptar</button></div></div>`;
  const ta = (body, q, over) => `<div class="ta"><div class="tx">${body || `<span class="ph1">${PLACEHOLDER}</span>`}</div><span class="q${over ? ' over' : ''}">${q}</span></div>`;
  function card(c, s, d) {
    const sel = c.selector ? `<div class="sel">${c.selector(d, s)}</div>` : '';
    const left = s.left || (ta(s.text, s.q, s.over) + (s.warn ? `<div class="warn">${s.warn}</div>` : '') + `<div class="run">${s.run}</div>`);
    if (d) return `<div class="card">${sel}<div class="cols"><div class="l">${left}</div><div class="r"><div class="out">${s.out || `<span>${c.outEmpty}</span>`}</div></div></div></div>`;
    if (s.mobile) return `<div class="card">${sel}${s.mobile}</div>`;
    return `<div class="card">${sel}${left}<div class="out">${s.out || c.outEmpty}</div></div>`;
  }
  function page(c, s, d, opt = {}) {
    const inner = header(d) + tabs(c.key, d) + `<div class="main${d ? ' wrap' : ''}">${title(c, d)}${card(c, s, d)}${below(c)}</div>`;
    return inner + (opt.cookies ? cookies : '');
  }
  function measure(root, scale) {
    const p = root.getBoundingClientRect(), b = root.querySelector('.btn-run');
    if (!b) return '';
    const r = b.getBoundingClientRect();
    return `${Math.round((r.top - p.top) / scale)}–${Math.round((r.bottom - p.top) / scale)}`;
  }
  window.F2 = {
    render(c) {
      const m = document.getElementById('mob'), dk = document.getElementById('desk');
      m.innerHTML = c.mobile.map((f, i) => `<div class="fw" data-screen-label="F2 ${c.short} móvil ${i + 1}"><div class="cap">${f.t}<span>${f.d}</span><span class="mm"></span></div><div class="ph${f.tall ? '' : ' fold'}">${page(c, f.s, false, f)}${f.tall ? '<div class="fl" style="top:844px"><b>pliegue 844</b></div>' : ''}</div></div>`).join('');
      dk.innerHTML = c.desktop.map((f, i) => `<div class="fw" data-screen-label="F2 ${c.short} escritorio ${i + 1}"><div class="cap dcap">${f.t}<span>${f.d}</span><span class="mm"></span></div><div class="scale" style="--s:.62;--h:${f.h || 800}px"><div class="dk">${page(c, f.s, true)}<div class="fl" style="top:640px"><b>límite del brief · 640</b></div>${(f.h || 800) > 800 ? '<div class="fl" style="top:800px;border-color:#a3a3a3"><b style="color:#737373">portátil · 800</b></div>' : ''}</div></div></div>`).join('');
      requestAnimationFrame(() => {
        m.querySelectorAll('.fw').forEach((w) => { const v = measure(w.querySelector('.ph'), 1); if (v) w.querySelector('.mm').textContent = 'Medido: botón de ejecución ' + v; });
        dk.querySelectorAll('.fw').forEach((w) => { const v = measure(w.querySelector('.dk'), .62); if (v) w.querySelector('.mm').textContent = 'Medido: botón de ejecución ' + v + ' (límite 640)'; });
      });
    },
    ta,
  };
})();
