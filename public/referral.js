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

  // "Sarah Mitchell" -> "sarah-m"; with number 2 -> "sarah-m2".
  // Needs a first and a last name; returns "" otherwise.
  function codeFromName(fullName, number) {
    if (typeof fullName !== 'string') return '';
    var plain = fullName.normalize ? fullName.normalize('NFD').replace(/[̀-ͯ]/g, '') : fullName;
    var words = plain.toLowerCase().replace(/['’]/g, '').replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean);
    if (words.length < 2) return '';
    var initial = words.pop().charAt(0);
    var n = Math.floor(Number(number));
    var suffix = (n >= 2 && n <= 999) ? String(n) : '';
    var code = words.join('-') + '-' + initial + suffix;
    // A very long name keeps only the first name.
    if (code.length > MAX) code = words[0].slice(0, MAX - 2 - suffix.length) + '-' + initial + suffix;
    return CODE.test(code) ? code : '';
  }

  function linkFor(origin, code) {
    return String(origin).replace(/\/+$/, '') + '/?ref=' + encodeURIComponent(code);
  }

  var api = { nameFromCode: nameFromCode, codeFromName: codeFromName, linkFor: linkFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HeroReferral = api;
})(typeof self !== 'undefined' ? self : this);
