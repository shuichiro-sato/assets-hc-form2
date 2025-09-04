
/*!
 * HC Form CSS Loader v1.0.0
 * - GitHub Pages 等の「ディレクトリ風」配下から CSS を読み分けて注入
 * - window.__HC_FORM_LOADER__ の設定で挙動を上書き可能
 */
(function () {
  var cfg = (window.__HC_FORM_LOADER__ || {});

  // 基本設定（iframe側から上書き可）
  var CDN_BASE = (cfg.cdnBase || 'https://shuichiro-sato.github.io/assets-hc-form2/hc/forms').replace(/\/$/, '');
  var VERSION  = (cfg.version || '2025-09-04');  // キャッシュバスト用
  var DEFAULT_DIR = (cfg.defaultDir || 'default');
  var FILE_NAME = (cfg.file || 'formA.css');
  var FORCE_PARAM = 'css_dir'; // ?css_dir=lp/ver4Gdb のように強制指定できる

  function trimSlashes(s) {
    return String(s || '').replace(/^\/*|\/*$/g, '');
  }

  function decideDir() {
    // 1) ?css_dir=... で明示指定
    try {
      var q = new URLSearchParams(location.search);
      var d = q.get(FORCE_PARAM);
      if (d) return trimSlashes(d);
    } catch (_) {}

    // 2) グローバル設定で固定指定（例: { dir: 'lp/ver4Gdb' }）
    if (cfg.dir) return trimSlashes(cfg.dir);

    // 3) 親URLのパスでマッピング
    //    dirByPath は [ ['\\/lp\\/ver4Gdb\\/', 'lp/ver4Gdb'], ... ] の配列
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

  function once(id) {
    return !!document.getElementById(id);
  }

  function inject(dir) {
    var baseId = '__hc_form_css__';
    if (once(baseId)) return;

    var href = CDN_BASE + '/' + trimSlashes(dir) + '/' + FILE_NAME + '?v=' + encodeURIComponent(VERSION);

    // preload → stylesheet（FOUC軽減）
    var preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as  = 'style';
    preload.href = href;
    preload.id = baseId + '_preload';
    (document.head || document.documentElement).appendChild(preload);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = baseId;
    (document.head || document.documentElement).appendChild(link);
  }

  // 初回注入
  inject(decideDir());

  // 親URLが後から届いたときに再判定したい場合（任意）
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.type === 'PARENT_URL' && d.href) {
      if (!window.__PARENT_HREF_FOR_CSS__) window.__PARENT_HREF_FOR_CSS__ = d.href;

      // 設定で recheckOnParent:true のときだけ1回差し替え
      if (cfg.recheckOnParent) {
        var newDir = decideDir();
        var nextHref = CDN_BASE + '/' + trimSlashes(newDir) + '/' + FILE_NAME + '?v=' + encodeURIComponent(VERSION);

        var oldLink = document.getElementById('__hc_form_css__');
        var prevHref = oldLink ? oldLink.href : '';

        if (nextHref !== prevHref) {
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = nextHref;
          link.id = '__hc_form_css__';
          oldLink && oldLink.replaceWith(link);
        }
      }
    }
  }, false);
})();
