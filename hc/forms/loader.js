/*!
 * HC Form CSS Loader v1.0.0
 */
(function () {
  var cfg = (window.__HC_FORM_LOADER__ || {});

  // 基本設定（iframe側から上書き可）
  var CDN_BASE = (cfg.cdnBase || 'https://shuichiro-sato.github.io/assets-hc-form2/hc/forms').replace(/\/$/, '');
  var VERSION  = (cfg.version || '2025-09-04');  // キャッシュバスト用
  var DEFAULT_DIR = (cfg.defaultDir || 'default');
  var FILE_NAME = (cfg.file || 'formA.css');
  var FORCE_PARAM = 'css_dir'; // ?css_dir=lp/ver4Gdb で強制指定

  function trimSlashes(s) {
    return String(s || '').replace(/^\/*|\/*$/g, '');
  }

  function decideDir() {
    // 1) ?css_dir=...
    try {
      var q = new URLSearchParams(location.search);
      var d = q.get(FORCE_PARAM);
      if (d) return trimSlashes(d);
    } catch (_) {}

    // 2) グローバル設定で固定指定
    if (cfg.dir) return trimSlashes(cfg.dir);

    // 3) 親URLのパスでマッピング
    try {
      var href = (window.__PARENT_HREF_FOR_CSS__) || document.referrer || '';
      var p = href ? new URL(href).pathname : '';
      var map = (cfg.dirByPath || []);
      for (var i = 0; i < map.length; i++) {
        var m = map[i];
        if (new RegExp(m[0]).test(p)) return m[1];
      }
    } catch (_) {}

    // 4) 既定
    return DEFAULT_DIR;
  }

  function already(id) { return !!document.getElementById(id); }

  function inject(dir) {
    var LINK_ID = '__hc_form_css__';
    if (already(LINK_ID)) return;

    var href = CDN_BASE + '/' + trimSlashes(dir) + '/' + FILE_NAME + '?v=' + encodeURIComponent(VERSION);

    // preload → stylesheet
    var preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as  = 'style';
    preload.href = href;
    preload.id = LINK_ID + '_preload';
    (document.head || document.documentElement).appendChild(preload);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = LINK_ID;
    (document.head || document.documentElement).appendChild(link);
  }

  // 初回注入
  inject(decideDir());

  // 親URL受信後に差し替えたい場合
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.type === 'PARENT_URL' && d.href) {
      if (!window.__PARENT_HREF_FOR_CSS__) window.__PARENT_HREF_FOR_CSS__ = d.href;
      if (cfg.recheckOnParent) {
        var dir = decideDir();
        var nextHref = CDN_BASE + '/' + trimSlashes(dir) + '/' + FILE_NAME + '?v=' + encodeURIComponent(VERSION);
        var oldLink = document.getElementById('__hc_form_css__');
        if (!oldLink || oldLink.href !== nextHref) {
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = nextHref;
          link.id = '__hc_form_css__';
          oldLink ? oldLink.replaceWith(link) : (document.head || document.documentElement).appendChild(link);
        }
      }
    }
  }, false);
})();
