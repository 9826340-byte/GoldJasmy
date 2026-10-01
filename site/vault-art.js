// Vault artwork (vector): open safe interior sized to the real viewport, cast gold bar, coin face.
// Everything is drawn in screen pixels so larger phones get more space, not larger objects.
(function (root) {
  'use strict';
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function r(n) { return Math.round(n * 10) / 10; }

  function cushionFront(cl, cr, ct, fb) {
    return 'M' + r(cl) + ' ' + ct + 'C' + r(cl - 4) + ' ' + (ct + 26) + ' ' + r(cl + 8) + ' ' + (fb - 2) + ' ' + r(cl + 34) + ' ' + fb +
           'H' + r(cr - 34) + 'C' + r(cr - 8) + ' ' + (fb - 2) + ' ' + r(cr + 4) + ' ' + (ct + 26) + ' ' + r(cr) + ' ' + ct +
           'A' + r((cr - cl) / 2) + ' 30 0 0 1 ' + r(cl) + ' ' + ct + 'Z';
  }

  // front roll of the velvet that the bar sinks into: drawn ABOVE the bar
  function cushionFrontSVG(w, h, floorY) {
    var cx = w / 2, cw = Math.min(w * 0.86, 360), ct = floorY - 4, rx = cw / 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="fRoll" x1="0" y1="' + (ct + 2) + '" x2="0" y2="' + (ct + 50) + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#2A2A2E"/><stop offset=".3" stop-color="#141416"/><stop offset="1" stop-color="#050506"/></linearGradient></defs>' +
      // plush edge in front of the bar's foot: the lower half of the top ellipse, raised a little
      '<path d="M' + r(cx - rx) + ' ' + ct + 'A' + r(rx) + ' 13 0 0 0 ' + r(cx + rx) + ' ' + ct +
        'C' + r(cx + rx + 4) + ' ' + (ct + 26) + ' ' + r(cx + rx - 8) + ' ' + (ct + 48) + ' ' + r(cx + rx - 34) + ' ' + (ct + 50) +
        'H' + r(cx - rx + 34) + 'C' + r(cx - rx + 8) + ' ' + (ct + 48) + ' ' + r(cx - rx - 4) + ' ' + (ct + 26) + ' ' + r(cx - rx) + ' ' + ct + 'Z" fill="url(#fRoll)"/>' +
      '<path d="M' + r(cx - rx + 10) + ' ' + (ct + 4) + 'A' + r(rx - 10) + ' 11 0 0 0 ' + r(cx + rx - 10) + ' ' + (ct + 4) + '" fill="none" stroke="#FFF" stroke-opacity=".09" stroke-width="1.2"/>' +
      '<path d="M' + r(cx - 74) + ' ' + (ct + 27) + 'Q' + cx + ' ' + (ct + 36) + ' ' + r(cx + 74) + ' ' + (ct + 27) + '" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.4"/>' +
      '</svg>';
  }

  // ---------- vault interior (full screen) ----------
  // layout: { w, h, floorY } -> SVG string
  function vaultSVG(w, h, floorY) {
    var d = Math.round(clamp(w * 0.1, 28, 48));          // side-wall depth
    var c = Math.round(clamp(h * 0.06, 36, 58));         // ceiling depth
    var cx = w / 2;
    var cw = Math.min(w * 0.86, 360);                   // cushion width
    var cl = cx - cw / 2, cr = cx + cw / 2;
    var ct = floorY - 4;                                 // cushion top line
    var s = [];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">');
    s.push('<defs>' +
      '<linearGradient id="vBack" x1="0" y1="' + c + '" x2="0" y2="' + floorY + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#1B1B1E"/><stop offset=".55" stop-color="#18181B"/><stop offset="1" stop-color="#101012"/></linearGradient>' +
      '<linearGradient id="vSideL" x1="0" y1="0" x2="' + d + '" y2="0" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#060607"/><stop offset="1" stop-color="#141416"/></linearGradient>' +
      '<linearGradient id="vSideR" x1="' + w + '" y1="0" x2="' + (w - d) + '" y2="0" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#060607"/><stop offset="1" stop-color="#141416"/></linearGradient>' +
      '<linearGradient id="vCeil" x1="0" y1="0" x2="0" y2="' + c + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#050506"/><stop offset="1" stop-color="#121214"/></linearGradient>' +
      '<linearGradient id="vFloor" x1="0" y1="' + floorY + '" x2="0" y2="' + h + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#151517"/><stop offset="1" stop-color="#060607"/></linearGradient>' +
      '<radialGradient id="vSpot" cx="' + cx + '" cy="' + r(floorY - 120) + '" r="' + r(w * 0.66) + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#FFC46E" stop-opacity=".16"/><stop offset=".45" stop-color="#FFB24E" stop-opacity=".06"/>' +
        '<stop offset="1" stop-color="#FFB24E" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="vCone" x1="0" y1="' + c + '" x2="0" y2="' + floorY + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#FFD9A0" stop-opacity=".07"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></linearGradient>' +
      '<pattern id="vBrush" width="6" height="3" patternUnits="userSpaceOnUse">' +
        '<rect width="6" height="3" fill="none"/><path d="M0 .5H6" stroke="#FFFFFF" stroke-opacity=".022" stroke-width=".6"/></pattern>' +
      '<radialGradient id="vCushTop" cx=".5" cy=".42" r=".62">' +
        '<stop offset="0" stop-color="#232327"/><stop offset=".7" stop-color="#121214"/><stop offset="1" stop-color="#09090A"/></radialGradient>' +
      '<linearGradient id="vCushFront" x1="0" y1="' + ct + '" x2="0" y2="' + (ct + 50) + '" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#1E1E21"/><stop offset=".35" stop-color="#121214"/><stop offset="1" stop-color="#030304"/></linearGradient>' +
      '<radialGradient id="vPuff" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#2A2A2F"/><stop offset=".7" stop-color="#151518"/><stop offset="1" stop-color="#070708"/></radialGradient>' +
      '<pattern id="vTuft" width="44" height="20" patternUnits="userSpaceOnUse" x="' + r(cx - 22) + '" y="' + r(ct - 10) + '">' +
        '<path d="M0 10L22 0L44 10L22 20Z" fill="url(#vPuff)"/>' +
        '<path d="M0 10L22 0L44 10L22 20Z" fill="none" stroke="#000" stroke-opacity=".9" stroke-width="1.4"/>' +
        '<path d="M4 9.6L22 1.6L40 9.6" fill="none" stroke="#FFF" stroke-opacity=".07" stroke-width=".8"/>' +
        '<circle cx="22" cy="0" r="1.8" fill="#000"/><circle cx="0" cy="10" r="1.8" fill="#000"/><circle cx="44" cy="10" r="1.8" fill="#000"/><circle cx="22" cy="20" r="1.8" fill="#000"/>' +
        '<circle cx="21.6" cy="19.4" r=".7" fill="#FFF" fill-opacity=".15"/></pattern>' +
      '<pattern id="vQuilt" width="30" height="12" patternUnits="userSpaceOnUse" x="' + r(cx - 15) + '" y="' + r(ct - 6) + '">' +
        '<path d="M0 6L15 0L30 6L15 12Z" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.2"/>' +
        '<path d="M0 6.8L15 .8L30 6.8L15 12.8Z" fill="none" stroke="#FFF" stroke-opacity=".05" stroke-width=".8"/>' +
        '<circle cx="15" cy="0" r="1.3" fill="#000" fill-opacity=".8"/><circle cx="0" cy="6" r="1.3" fill="#000" fill-opacity=".8"/>' +
        '<circle cx="30" cy="6" r="1.3" fill="#000" fill-opacity=".8"/><circle cx="15" cy="12" r="1.3" fill="#000" fill-opacity=".8"/></pattern>' +
      '<pattern id="vPleat" width="14" height="60" patternUnits="userSpaceOnUse" x="' + r(cx) + '">' +
        '<path d="M7 0V60" stroke="#000" stroke-opacity=".5" stroke-width="1"/><path d="M8 0V60" stroke="#FFF" stroke-opacity=".035" stroke-width=".8"/></pattern>' +
      '<linearGradient id="vSteel" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2C2C30"/><stop offset=".5" stop-color="#18181B"/><stop offset="1" stop-color="#0B0B0C"/></linearGradient>' +
      '<linearGradient id="vBolt" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#8E8B84"/><stop offset=".35" stop-color="#3A3936"/><stop offset=".7" stop-color="#1A1A1B"/><stop offset="1" stop-color="#4A4640"/></linearGradient>' +
      '<filter id="vBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
    '</defs>');

    // walls
    s.push('<rect width="' + w + '" height="' + h + '" fill="#09090A"/>');
    s.push('<path d="M0 0H' + w + 'L' + (w - d) + ' ' + c + 'H' + d + 'Z" fill="url(#vCeil)"/>');
    s.push('<rect x="' + d + '" y="' + c + '" width="' + (w - 2 * d) + '" height="' + (floorY - c) + '" fill="url(#vBack)"/>');
    s.push('<rect x="' + d + '" y="' + c + '" width="' + (w - 2 * d) + '" height="' + (floorY - c) + '" fill="url(#vBrush)"/>');
    s.push('<path d="M0 0L' + d + ' ' + c + 'V' + floorY + 'L0 ' + h + 'Z" fill="url(#vSideL)"/>');
    s.push('<path d="M' + w + ' 0L' + (w - d) + ' ' + c + 'V' + floorY + 'L' + w + ' ' + h + 'Z" fill="url(#vSideR)"/>');
    s.push('<path d="M' + d + ' ' + floorY + 'H' + (w - d) + 'L' + w + ' ' + h + 'H0Z" fill="url(#vFloor)"/>');

    // side-wall seams in perspective (panel joints)
    [0.22, 0.47, 0.72].forEach(function (k) {
      var ys = h * k, yb = c + ys * (floorY - c) / h;
      s.push('<path d="M0 ' + r(ys) + 'L' + d + ' ' + r(yb) + '" stroke="#000" stroke-opacity=".7" stroke-width="1.2"/>');
      s.push('<path d="M0 ' + r(ys + 1.2) + 'L' + d + ' ' + r(yb + 1) + '" stroke="#FFF" stroke-opacity=".04" stroke-width=".8"/>');
      s.push('<path d="M' + w + ' ' + r(ys) + 'L' + (w - d) + ' ' + r(yb) + '" stroke="#000" stroke-opacity=".7" stroke-width="1.2"/>');
      s.push('<path d="M' + w + ' ' + r(ys + 1.2) + 'L' + (w - d) + ' ' + r(yb + 1) + '" stroke="#FFF" stroke-opacity=".04" stroke-width=".8"/>');
    });
    // back-wall rivet rows
    for (var y = c + 22; y < floorY - 14; y += 34) {
      s.push('<circle cx="' + (d + 12) + '" cy="' + y + '" r="1.6" fill="#000" fill-opacity=".6"/><circle cx="' + (d + 11.6) + '" cy="' + (y - .5) + '" r=".9" fill="#FFF" fill-opacity=".07"/>');
      s.push('<circle cx="' + (w - d - 12) + '" cy="' + y + '" r="1.6" fill="#000" fill-opacity=".6"/><circle cx="' + (w - d - 12.4) + '" cy="' + (y - .5) + '" r=".9" fill="#FFF" fill-opacity=".07"/>');
    }
    // edges where the planes meet
    s.push('<path d="M' + d + ' ' + c + 'H' + (w - d) + 'V' + floorY + 'H' + d + 'Z" fill="none" stroke="#FFF" stroke-opacity=".06" stroke-width=".8"/>');
    s.push('<path d="M0 0L' + d + ' ' + c + 'M' + w + ' 0L' + (w - d) + ' ' + c + 'M0 ' + h + 'L' + d + ' ' + floorY + 'M' + w + ' ' + h + 'L' + (w - d) + ' ' + floorY + '" stroke="#FFF" stroke-opacity=".035" stroke-width=".8"/>');

    // warm light: ceiling fixture, soft cone, spot on the back wall and floor
    var lw = Math.min(w * 0.3, 140);
    s.push('<path d="M' + r(cx - lw / 2) + ' ' + c + 'H' + r(cx + lw / 2) + 'L' + r(cx + cw * 0.55) + ' ' + floorY + 'H' + r(cx - cw * 0.55) + 'Z" fill="url(#vCone)"/>');
    s.push('<rect x="' + d + '" y="' + c + '" width="' + (w - 2 * d) + '" height="' + (floorY - c) + '" fill="url(#vSpot)"/>');
    s.push('<rect x="' + r(cx - lw / 2) + '" y="' + (c - 5) + '" width="' + r(lw) + '" height="7" rx="3" fill="#FFCF85" opacity=".35" filter="url(#vBlur)"/>');
    s.push('<rect x="' + r(cx - lw / 2) + '" y="' + (c - 3) + '" width="' + r(lw) + '" height="2.4" rx="1.2" fill="#FFE7BD" opacity=".8"/>');
    s.push('<ellipse cx="' + cx + '" cy="' + (floorY + 30) + '" rx="' + r(cw * 0.62) + '" ry="34" fill="#FFB54F" opacity=".05"/>');

    // black velvet cushion: tufted top (behind the bar); its front roll is drawn above the bar (cushionFrontSVG)
    var fb = ct + 50;
    s.push('<ellipse cx="' + cx + '" cy="' + (fb + 8) + '" rx="' + r(cw / 2 + 10) + '" ry="14" fill="#000" opacity=".8" filter="url(#vBlur)"/>');
    s.push('<path d="' + cushionFront(cl, cr, ct, fb) + '" fill="url(#vCushFront)"/>');
    s.push('<ellipse cx="' + cx + '" cy="' + ct + '" rx="' + r(cw / 2) + '" ry="30" fill="url(#vCushTop)"/>');
    s.push('<ellipse cx="' + cx + '" cy="' + ct + '" rx="' + r(cw / 2 - 8) + '" ry="25" fill="url(#vTuft)"/>');
    s.push('<ellipse cx="' + cx + '" cy="' + ct + '" rx="' + r(cw / 2) + '" ry="30" fill="none" stroke="#FFF" stroke-opacity=".06" stroke-width="1"/>');
    s.push('<ellipse cx="' + cx + '" cy="' + (ct - 6) + '" rx="' + r(cw * 0.22) + '" ry="9" fill="#FFC46E" opacity=".06"/>');

    // vault mouth: heavy steel frame around the screen
    s.push('<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" fill="none" stroke="#1E1E21" stroke-width="6"/>');
    s.push('<rect x="6.5" y="6.5" width="' + (w - 13) + '" height="' + (h - 13) + '" fill="none" stroke="#FFF" stroke-opacity=".05" stroke-width="1"/>');

    // open door: its edge on the right, with locking bolts withdrawn into it
    var dt = Math.round(h * 0.07), db = Math.round(h * 0.93);
    s.push('<rect x="' + (w - 24) + '" y="' + (dt - 2) + '" width="28" height="' + (db - dt + 4) + '" rx="3" fill="#000" opacity=".7" filter="url(#vBlur)"/>');
    s.push('<rect x="' + (w - 20) + '" y="' + dt + '" width="22" height="' + (db - dt) + '" rx="3" fill="url(#vSteel)"/>');
    s.push('<path d="M' + (w - 19.4) + ' ' + (dt + 5) + 'V' + (db - 5) + '" stroke="#FFF" stroke-opacity=".16" stroke-width="1"/>');
    s.push('<path d="M' + (w - 13) + ' ' + (dt + 5) + 'V' + (db - 5) + '" stroke="#000" stroke-opacity=".55" stroke-width="1"/>');
    [0.18, 0.5, 0.82].forEach(function (k) {
      var by = Math.round(dt + 40 + (floorY - 60 - dt - 40) * k);
      s.push('<rect x="' + (w - 48) + '" y="' + (by - 9) + '" width="32" height="20" rx="6" fill="#000" opacity=".55" filter="url(#vBlur)"/>');
      s.push('<rect x="' + (w - 47) + '" y="' + (by - 8) + '" width="30" height="16" rx="8" fill="url(#vBolt)"/>');
      s.push('<ellipse cx="' + (w - 45) + '" cy="' + by + '" rx="3.4" ry="8" fill="#5C5852"/>');
      s.push('<rect x="' + (w - 42) + '" y="' + (by - 5.5) + '" width="22" height="2.2" rx="1.1" fill="#FFF" opacity=".22"/>');
    });
    s.push('</svg>');
    return s.join('');
  }

  // ---------- cast gold bar, front view (200 x 250 user units) ----------
  // o.mark: href of the white-on-transparent JASMY mark; o.id: unique prefix
  function barSVG(o) {
    o = o || {};
    var p = o.id || 'gb', mark = o.mark || 'brand/jasmy-mark.png';
    var serif = 'font-family="Palatino, \'Palatino Linotype\', \'Book Antiqua\', Georgia, serif" text-anchor="middle"';
    function engrave(content) {
      return '<g transform="translate(0 .8)" fill="#FFF4CC" opacity=".5">' + content + '</g>' +
             '<g fill="#6A440C" opacity=".72">' + content + '</g>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"' + (o.attrs ? ' ' + o.attrs : '') + '>' +
      '<defs>' +
        '<linearGradient id="' + p + 'T" x1="0" y1="2" x2="0" y2="26" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFF6D0"/><stop offset=".5" stop-color="#F1CF7A"/><stop offset="1" stop-color="#C99536"/></linearGradient>' +
        '<linearGradient id="' + p + 'B" x1="8" y1="0" x2="192" y2="0" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#5E3C08"/><stop offset=".14" stop-color="#B9852A"/><stop offset=".36" stop-color="#FFEDB5"/>' +
          '<stop offset=".5" stop-color="#E2B24C"/><stop offset=".78" stop-color="#9C6B1A"/><stop offset="1" stop-color="#4E3106"/></linearGradient>' +
        '<linearGradient id="' + p + 'F" x1="0" y1="38" x2="0" y2="222" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#F8DD8E"/><stop offset=".4" stop-color="#E2B04A"/><stop offset=".8" stop-color="#B77F22"/><stop offset="1" stop-color="#94621A"/></linearGradient>' +
        '<linearGradient id="' + p + 'S" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#FFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFF8DC" stop-opacity=".42"/>' +
          '<stop offset="1" stop-color="#FFF" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="' + p + 'D" x1="0" y1="150" x2="0" y2="236" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#3A2405" stop-opacity="0"/><stop offset="1" stop-color="#3A2405" stop-opacity=".35"/></linearGradient>' +
        '<clipPath id="' + p + 'C"><path d="M40 38H160L174 222H26Z"/></clipPath>' +
        '<mask id="' + p + 'M" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="250"><image href="' + mark + '" x="77" y="58" width="46" height="46"/></mask>' +
        '<mask id="' + p + 'M2" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="250"><image href="' + mark + '" x="77" y="58.8" width="46" height="46"/></mask>' +
      '</defs>' +
      '<ellipse cx="100" cy="238" rx="98" ry="7" fill="#000" opacity=".75"/>' +
      '<path d="M44 2H156L174 26H26Z" fill="url(#' + p + 'T)"/>' +
      '<path d="M60 7H140L148 18H52Z" fill="#FFFBE8" opacity=".32"/>' +
      '<path d="M26 26H174L192 236H8Z" fill="url(#' + p + 'B)"/>' +
      '<path d="M40 38H160L174 222H26Z" fill="url(#' + p + 'F)"/>' +
      '<g clip-path="url(#' + p + 'C)"><rect x="40" y="20" width="44" height="230" fill="url(#' + p + 'S)" transform="skewX(-14)"/>' +
        '<rect x="0" y="150" width="200" height="90" fill="url(#' + p + 'D)"/></g>' +
      // bevel light/shadow lines
      '<path d="M26 26H174" stroke="#FFF6D2" stroke-width="1.4" opacity=".95"/>' +
      '<path d="M40 38H160" stroke="#8A5E16" stroke-width="1" opacity=".55"/>' +
      '<path d="M26 222H174" stroke="#FFE7A8" stroke-width=".9" opacity=".45"/>' +
      '<path d="M8 236H192" stroke="#5A3A08" stroke-width="1.4" opacity=".7"/>' +
      '<path d="M44 2H156L174 26L192 236H8L26 26Z" fill="none" stroke="#5A3A08" stroke-opacity=".45" stroke-width=".7" stroke-linejoin="round"/>' +
      // stamp
      '<circle cx="100" cy="81.8" r="31" fill="none" stroke="#FFF4CC" stroke-opacity=".45" stroke-width="1.4"/>' +
      '<circle cx="100" cy="81" r="31" fill="none" stroke="#6A440C" stroke-opacity=".6" stroke-width="1.4"/>' +
      '<rect width="200" height="250" fill="#FFF4CC" opacity=".5" mask="url(#' + p + 'M2)"/>' +
      '<rect width="200" height="250" fill="#6A440C" opacity=".72" mask="url(#' + p + 'M)"/>' +
      engrave('<text x="100" y="142" font-size="21" letter-spacing="4.2" ' + serif + '>JASMY</text>') +
      engrave('<rect x="80" y="152" width="40" height=".9"/>') +
      engrave('<text x="100" y="174" font-size="8.6" letter-spacing="3" ' + serif + '>FINE GOLD</text>') +
      engrave('<text x="100" y="197" font-size="16" letter-spacing="1.4" ' + serif + '>999.9</text>') +
    '</svg>';
  }

  // ---------- coin face (64 x 64), JASMY mark struck in the centre ----------
  function coinSVG(markHref) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">' +
      '<defs><radialGradient id="cf" cx="24" cy="20" r="40" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#FFF1BC"/><stop offset=".45" stop-color="#E6BD5C"/><stop offset="1" stop-color="#A9761F"/></radialGradient>' +
      '<mask id="cm" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><image href="' + markHref + '" x="19" y="19" width="26" height="26"/></mask>' +
      '<mask id="cm2" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><image href="' + markHref + '" x="19" y="19.6" width="26" height="26"/></mask></defs>' +
      '<circle cx="32" cy="32" r="31" fill="#8C6118"/>' +
      '<circle cx="32" cy="32" r="29" fill="url(#cf)"/>' +
      '<circle cx="32" cy="32" r="23.5" fill="none" stroke="#7A520F" stroke-opacity=".55" stroke-width="1.1"/>' +
      '<circle cx="32" cy="32.6" r="23.5" fill="none" stroke="#FFF3C8" stroke-opacity=".45" stroke-width=".8"/>' +
      '<rect width="64" height="64" fill="#FFF4CC" opacity=".5" mask="url(#cm2)"/>' +
      '<rect width="64" height="64" fill="#6A440C" opacity=".75" mask="url(#cm)"/>' +
      '<ellipse cx="22" cy="17" rx="9" ry="4" fill="#FFF" opacity=".28" transform="rotate(-30 22 17)"/>' +
      '</svg>';
  }

  function iconSVG(markHref, size) {
    size = size || 512;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 512 512">' +
      '<defs><radialGradient id="iBg" cx="256" cy="190" r="360" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#2A2621"/><stop offset=".45" stop-color="#141315"/><stop offset="1" stop-color="#060607"/></radialGradient>' +
      '<radialGradient id="iCush" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#26262A"/><stop offset="1" stop-color="#070708"/></radialGradient>' +
      '<linearGradient id="iCone" x1="0" y1="40" x2="0" y2="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".10"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></linearGradient>' +
      '<filter id="iBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>' +
      '<rect width="512" height="512" fill="url(#iBg)"/>' +
      '<path d="M196 44H316L420 420H92Z" fill="url(#iCone)"/>' +
      '<rect x="196" y="40" width="120" height="6" rx="3" fill="#FFE7BD" opacity=".7"/>' +
      '<ellipse cx="256" cy="420" rx="190" ry="26" fill="#000" opacity=".8" filter="url(#iBlur)"/>' +
      '<ellipse cx="256" cy="394" rx="176" ry="34" fill="url(#iCush)"/>' +
      barSVG({ id: 'ic', mark: markHref, attrs: 'x="124" y="130" width="264" height="330"' }) +
      '<path d="M80 394A176 20 0 0 0 432 394C434 414 420 430 392 432H120C92 430 78 414 80 394Z" fill="#0B0B0C"/>' +
      '<path d="M92 400A164 16 0 0 0 420 400" fill="none" stroke="#FFF" stroke-opacity=".08" stroke-width="2"/>' +
    '</svg>';
  }

  root.VaultArt = { iconSVG: iconSVG, vaultSVG: vaultSVG, cushionFrontSVG: cushionFrontSVG, barSVG: barSVG, coinSVG: coinSVG };
})(this);
