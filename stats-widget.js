/* Iron Noodle — Live Stats Widget
   Paste this in Framer Site Settings → Custom Code → End of <body>
   Fetches live data from roi.ironnoodle.com/stats.json and animates homepage counters */
(function() {
  var STATS_URL = 'https://roi.ironnoodle.com/stats.json';
  var DURATION = 2000;

  function animateValue(el, start, end, prefix, suffix, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(start + (end - start) * eased);
      if (end >= 1000) {
        el.textContent = prefix + current.toLocaleString() + suffix;
      } else {
        el.textContent = prefix + current + suffix;
      }
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function findStatBlocks() {
    var blocks = [];
    var paragraphs = document.querySelectorAll('p, span, div');
    paragraphs.forEach(function(el) {
      var text = el.textContent.trim().toUpperCase();
      if (text === 'FIRMS AUTOMATED' || text === 'DEALS WON') {
        blocks.push({ label: el, key: 'firms' });
      } else if (text === 'TOTAL REVENUE GAIN' || text === 'PIPELINE VALUE') {
        blocks.push({ label: el, key: 'revenue' });
      } else if (text === 'SATISFACTION' || text === 'AI PRODUCTS') {
        blocks.push({ label: el, key: 'products' });
      }
    });
    return blocks;
  }

  function findValueEl(labelEl) {
    var parent = labelEl.parentElement;
    if (!parent) return null;
    var children = parent.querySelectorAll('p, span, div');
    for (var i = 0; i < children.length; i++) {
      var t = children[i].textContent.trim();
      if (t.match(/^[\$]?0[%]?$/) || t.match(/^\d/) && children[i] !== labelEl) {
        return children[i];
      }
    }
    return null;
  }

  function applyStats(data) {
    var m = data.metrics;
    var blocks = findStatBlocks();

    blocks.forEach(function(b) {
      var valueEl = findValueEl(b.label);
      if (!valueEl) return;

      if (b.key === 'firms') {
        b.label.textContent = m.firms_label || 'DEALS WON';
        animateValue(valueEl, 0, m.firms_automated, '', '', DURATION);
      } else if (b.key === 'revenue') {
        b.label.textContent = m.revenue_label || 'PIPELINE VALUE';
        animateValue(valueEl, 0, m.revenue_gain, '$', '', DURATION);
      } else if (b.key === 'products') {
        b.label.textContent = m.products_label || 'AI PRODUCTS';
        animateValue(valueEl, 0, m.products_live, '', '', DURATION);
      }
    });
  }

  function loadStats() {
    fetch(STATS_URL + '?t=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(applyStats)
      .catch(function() {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(loadStats, 500); });
  } else {
    setTimeout(loadStats, 500);
  }
})();
