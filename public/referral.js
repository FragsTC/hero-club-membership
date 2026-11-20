// Hero Club referral codes.
//
// A member's referral code is their name: first name(s), a hyphen, and the
// initial of their last name, with a number added when two members would
// otherwise share a code. "Sarah Mitchell" is sarah-m; a second Sarah M. is
// sarah-m2. The signup link carries it as ?ref=sarah-m, and the page turns it
// back into "Sarah M." without looking anything up.
//
// Used by index.html (to read a code) and refer.html (to make one).
(function (root) {
  var MAX = 40;
  // name part(s), then a single-letter initial, then an optional number
  var CODE = /^[a-z]+(-[a-z]+)*-[a-z]\d{0,3}$/;

  function cap(word) { return word.charAt(0).toUpperCase() + word.slice(1); }

  // "sarah-m" -> "Sarah M."   Anything that is not a code -> "".
  function nameFromCode(code) {
    if (typeof code !== 'string') return '';
    var c = code.trim().toLowerCase();
    if (c.length < 3 || c.length > MAX || !CODE.test(c)) return '';
    var parts = c.replace(/\d+$/, '').split('-');
    var initial = parts.pop();
    return parts.map(cap).join(' ') + ' ' + initial.toUpperCase() + '.';
  }

  // Letters that do not break down into a plain letter plus an accent.
  var PLAIN = { '\u00f8': 'o', '\u0142': 'l', '\u00e6': 'ae', '\u0153': 'oe', '\u00df': 'ss', '\u0111': 'd', '\u00f0': 'd', '\u00fe': 'th', '\u0131': 'i' };
  var TITLES = { dr: 1, mr: 1, mrs: 1, ms: 1, miss: 1, mx: 1, prof: 1, rev: 1 };
  var SUFFIXES = { jr: 1, sr: 1, ii: 1, iii: 1, iv: 1, v: 1 };

  // "Sarah Mitchell" -> "sarah-m"; with number 2 -> "sarah-m2".
  // Needs a first and a last name in letters that can be written a to z.
  // Only the initial of the last name is ever used: "Sarah Mitchell-Jones"
  // and "Sarah Mitchell Jr" are both sarah-m. Returns "" when it cannot make
  // a code, including for a number outside 2 to 999.
  function codeFromName(fullName, number) {
    if (typeof fullName !== 'string') return '';
    var suffix = '';
    if (number !== undefined && number !== null && String(number).trim() !== '' && Number(number) !== 1) {
      var n = Number(number);
      if (!(n >= 2 && n <= 999 && Math.floor(n) === n)) return '';
      suffix = String(n);
    }
    var plain = fullName.toLowerCase();
    if (plain.normalize) plain = plain.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    plain = plain.replace(/[\u00f8\u0142\u00e6\u0153\u00df\u0111\u00f0\u00fe\u0131]/g, function (ch) { return PLAIN[ch]; });
    // Anything still outside plain ASCII is a script this code cannot spell.
    if (/[^\x00-\x7f]/.test(plain)) return '';
    // Whole words first, so a hyphenated surname stays one word.
    var words = plain.replace(/['.,]/g, '').split(/\s+/).map(function (w) { return w.replace(/[^a-z-]/g, '').replace(/^-+|-+$/g, ''); }).filter(Boolean);
    while (words.length > 2 && TITLES[words[0]]) words.shift();
    while (words.length > 2 && SUFFIXES[words[words.length - 1]]) words.pop();
    if (words.length < 2) return '';
    var initial = words.pop().charAt(0);
    var first = [];
    words.forEach(function (w) { w.split('-').forEach(function (part) { if (part) first.push(part); }); });
    if (!first.length || !/[a-z]/.test(initial)) return '';
    var room = MAX - 2 - suffix.length;
    // A very long name loses its later first names, then is cut short.
    while (first.length > 1 && first.join('-').length > room) first.pop();
    var code = first.join('-').slice(0, room) + '-' + initial + suffix;
    return CODE.test(code) ? code : '';
  }

  function linkFor(origin, code) {
    return String(origin).replace(/\/+$/, '') + '/?ref=' + encodeURIComponent(code);
  }

  var api = { nameFromCode: nameFromCode, codeFromName: codeFromName, linkFor: linkFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HeroReferral = api;
})(typeof self !== 'undefined' ? self : this);
