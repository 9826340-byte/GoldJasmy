// Gold bar artwork (vector), shared by the app screen and the icon renderer.
// shine: adds a light band (class "gb-shine") clipped to the bar, animated from CSS.
// engrave: 'text' stamps "999.9 / FINE GOLD"; 'mark' stamps the JASMY mark (markHref = white-on-transparent PNG).
(function (root) {
  'use strict';

  function goldBarSVG(o) {
    o = o || {};
    var p = o.id || 'gb';
    var engrave = '';
    if (o.engrave === 'mark') {
      var m = 'x="79" y="47" width="42" height="42"';
      engrave =
        '<mask id="' + p + 'm" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="112">' +
          '<image href="' + o.markHref + '" ' + m + '/></mask>' +
        '<mask id="' + p + 'm2" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="112">' +
          '<image href="' + o.markHref + '" x="79" y="47.9" width="42" height="42"/></mask>' +
        '<rect width="200" height="112" fill="#FFF2C4" opacity=".55" mask="url(#' + p + 'm2)"/>' +
        '<rect width="200" height="112" fill="#94681C" opacity=".72" mask="url(#' + p + 'm)"/>';
    } else {
      var t = 'font-family="ui-serif, \'New York\', Georgia, serif" text-anchor="middle"';
      engrave =
        '<g ' + t + '>' +
          '<text x="100" y="69.7" font-size="13" letter-spacing=".6" fill="#FFF2C4" opacity=".5">999.9</text>' +
          '<text x="100" y="69" font-size="13" letter-spacing=".6" fill="#8F6419" opacity=".62">999.9</text>' +
          '<text x="100.6" y="82.6" font-size="5.6" letter-spacing="2.2" fill="#FFF2C4" opacity=".5">FINE GOLD</text>' +
          '<text x="100.6" y="82" font-size="5.6" letter-spacing="2.2" fill="#8F6419" opacity=".62">FINE GOLD</text>' +
        '</g>';
    }
    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 112"' + (o.attrs ? ' ' + o.attrs : '') + '>' +
      '<defs>' +
        '<linearGradient id="' + p + 't" x1="0" y1="14" x2="0" y2="40" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#F9E7A9"/><stop offset="1" stop-color="#E4C26E"/></linearGradient>' +
        '<linearGradient id="' + p + 'f" x1="14" y1="0" x2="186" y2="0" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#B98A30"/><stop offset=".3" stop-color="#DDB65A"/>' +
          '<stop offset=".52" stop-color="#EFD382"/><stop offset=".74" stop-color="#D4A848"/>' +
          '<stop offset="1" stop-color="#A97A25"/></linearGradient>' +
        '<linearGradient id="' + p + 'v" x1="0" y1="40" x2="0" y2="96" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#FFF6D8" stop-opacity=".22"/>' +
          '<stop offset="1" stop-color="#5A3A08" stop-opacity=".22"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="100" cy="99" rx="90" ry="4.5" fill="#6B4E1A" opacity=".10"/>' +
      '<path d="M52 14H148L166 40H34Z" fill="url(#' + p + 't)"/>' +
      '<path d="M34 40H166L186 96H14Z" fill="url(#' + p + 'f)"/>' +
      '<path d="M34 40H166L186 96H14Z" fill="url(#' + p + 'v)"/>' +
      '<path d="M34 40H166" stroke="#FFF4CF" stroke-width="1.1"/>' +
      '<path d="M52 14H148L166 40L186 96H14L34 40Z" fill="none" stroke="#7A561A" stroke-opacity=".35" stroke-width=".6" stroke-linejoin="round"/>' +
      engrave +
      (o.shine ?
        '<clipPath id="' + p + 'c"><path d="M52 14H148L166 40L186 96H14L34 40Z"/></clipPath>' +
        '<linearGradient id="' + p + 's" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>' +
          '<stop offset=".5" stop-color="#FFFBEA" stop-opacity=".75"/>' +
          '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>' +
        '<g clip-path="url(#' + p + 'c)"><g class="gb-shine">' +
          '<rect x="-10" y="-20" width="34" height="150" fill="url(#' + p + 's)" transform="skewX(-22)"/>' +
        '</g></g>' : '') +
      '</svg>';
  }

  root.GoldArt = { goldBarSVG: goldBarSVG, JASMY_ORANGE: '#F6921D' };
})(this);
