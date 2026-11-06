import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'index.html');
const BASE = 'https://www.realtts.live';
const TODAY = new Date().toISOString().slice(0, 10);

const LANGS = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ru', 'es', 'pt', 'ar'];
const DICTS = ['salesTranslations', 'barrierTranslations', 'videoTranslations', 'purchaseTranslations',
  'trialTranslations', 'trustTranslations', 'reviewTranslations', 'noappTranslations',
  'pricingTranslations', 'contractContentTranslations'];

const SEO = {
  'zh-CN': {
    title: 'RealTTS 实时同声传译｜跨境双向实时语音翻译软件',
    desc: 'RealTTS 是双向实时同声传译软件，支持微信、WhatsApp、LINE、Zoom、Telegram 等平台双向实时语音翻译，客户无需安装 App。让跨境沟通不再因语言流失订单。',
    short: '支持微信、WhatsApp、LINE、Zoom 等平台双向实时语音翻译，客户无需安装 App。月付 $20/台起，免费试用。',
    alt: 'RealTTS 实时同声传译——跨境双向实时语音翻译软件',
    keywords: '实时同声传译,语音翻译,实时翻译软件,跨境沟通,双向翻译,外贸翻译,视频会议翻译,RealTTS',
    ogLocale: 'zh_CN',
    offers: { monthly: '月付', quarterly: '季付', yearly: '年付' },
  },
  'zh-TW': {
    title: 'RealTTS 即時同步口譯｜跨境雙向即時語音翻譯軟體',
    desc: 'RealTTS 是雙向即時同步口譯軟體，支援微信、WhatsApp、LINE、Zoom、Telegram 等平台的雙向即時語音翻譯，客戶無需安裝 App。讓跨境溝通不再因語言流失訂單。',
    short: '支援微信、WhatsApp、LINE、Zoom 等平台的雙向即時語音翻譯，客戶無需安裝 App。月付 $20/台起，免費試用。',
    alt: 'RealTTS 即時同步口譯——跨境雙向即時語音翻譯軟體',
    keywords: '即時同步口譯,語音翻譯,雙向翻譯,跨境溝通,外貿翻譯,視訊會議翻譯,RealTTS',
    ogLocale: 'zh_TW',
    offers: { monthly: '月付', quarterly: '季付', yearly: '年付' },
  },
  en: {
    title: 'RealTTS Real-Time Interpretation | Two-Way Live Voice Translation',
    desc: 'RealTTS is two-way real-time interpretation software that translates live voice on WeChat, WhatsApp, LINE, Zoom, Telegram and more. Your clients install nothing. Never lose an order to a language barrier again.',
    short: 'Two-way live voice translation for WeChat, WhatsApp, LINE, Zoom and more. No app for your clients to install. From $20 per month, free trial.',
    alt: 'RealTTS real-time interpretation — two-way live voice translation for cross-border business',
    keywords: 'real-time interpretation,live voice translation,two-way translation,cross-border trade,WeChat translation,Zoom interpretation,RealTTS',
    ogLocale: 'en_US',
    offers: { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' },
  },
  ja: {
    title: 'RealTTS リアルタイム同時通訳｜双方向ライブ音声翻訳',
    desc: 'RealTTS は双方向リアルタイム同時通訳ソフトです。WeChat、WhatsApp、LINE、Zoom、Telegram などで音声をその場で通訳し、クライアント側にアプリのインストールは不要。言語の壁で商談を逃さないために。',
    short: 'WeChat、WhatsApp、LINE、Zoom などに対応した双方向リアルタイム音声翻訳。クライアントのインストールは不要。月額20ドルから、無料トライアルあり。',
    alt: 'RealTTS リアルタイム同時通訳 — 越境ビジネスのための双方向音声翻訳',
    keywords: 'リアルタイム同時通訳,音声翻訳,双方向翻訳,越境EC,WeChat 翻訳,Zoom 通訳,RealTTS',
    ogLocale: 'ja_JP',
    offers: { monthly: '月払い', quarterly: '四半期払い', yearly: '年払い' },
  },
  ko: {
    title: 'RealTTS 실시간 동시통역 | 양방향 라이브 음성 번역',
    desc: 'RealTTS는 양방향 실시간 동시통역 소프트웨어입니다. WeChat, WhatsApp, LINE, Zoom, Telegram 등에서 음성을 실시간 번역하며 고객은 앱을 설치할 필요가 없습니다. 언어 장벽 때문에 주문을 놓치지 마세요.',
    short: 'WeChat, WhatsApp, LINE, Zoom 등에서 양방향 실시간 음성 번역. 고객 앱 설치 불필요. 월 20달러부터, 무료 체험 제공.',
    alt: 'RealTTS 실시간 동시통역 — 크로스보더 비즈니스를 위한 양방향 음성 번역',
    keywords: '실시간 동시통역,음성 번역,양방향 번역,크로스보더 무역,위챗 번역,줌 통역,RealTTS',
    ogLocale: 'ko_KR',
    offers: { monthly: '월간', quarterly: '분기', yearly: '연간' },
  },
  ru: {
    title: 'RealTTS — синхронный перевод в реальном времени | Двусторонний голосовой перевод',
    desc: 'RealTTS — программа двустороннего синхронного перевода. Переводит голос в реальном времени в WeChat, WhatsApp, LINE, Zoom, Telegram и других приложениях. Клиентам не нужно ничего устанавливать. Не теряйте заказы из-за языкового барьера.',
    short: 'Двусторонний голосовой перевод для WeChat, WhatsApp, LINE, Zoom и других приложений. Клиентам не нужно устанавливать приложение. От $20 в месяц, есть бесплатный период.',
    alt: 'RealTTS — синхронный перевод в реальном времени для международного бизнеса',
    keywords: 'синхронный перевод,голосовой перевод,двусторонний перевод,международная торговля,перевод WeChat,перевод Zoom,RealTTS',
    ogLocale: 'ru_RU',
    offers: { monthly: 'Помесячно', quarterly: 'Поквартально', yearly: 'Годовой' },
  },
  es: {
    title: 'RealTTS — interpretación simultánea en tiempo real | Traducción de voz bidireccional',
    desc: 'RealTTS es un software de interpretación simultánea bidireccional que traduce voz en tiempo real en WeChat, WhatsApp, LINE, Zoom, Telegram y más. Tus clientes no instalan nada. No vuelvas a perder un pedido por el idioma.',
    short: 'Traducción de voz bidireccional en tiempo real para WeChat, WhatsApp, LINE, Zoom y más. Sin instalar nada para tus clientes. Desde 20 USD al mes, con prueba gratuita.',
    alt: 'RealTTS — interpretación simultánea en tiempo real para negocios transfronterizos',
    keywords: 'interpretación simultánea,traducción de voz,traducción bidireccional,comercio internacional,traducción WeChat,interpretación Zoom,RealTTS',
    ogLocale: 'es_ES',
    offers: { monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' },
  },
  pt: {
    title: 'RealTTS — interpretação simultânea em tempo real | Tradução de voz bidirecional',
    desc: 'O RealTTS é um software de interpretação simultânea bidirecional que traduz voz em tempo real no WeChat, WhatsApp, LINE, Zoom, Telegram e outros. Seus clientes não instalam nada. Não perca mais pedidos por causa do idioma.',
    short: 'Tradução de voz bidirecional em tempo real para WeChat, WhatsApp, LINE, Zoom e mais. Sem instalação para seus clientes. A partir de US$ 20 por mês, com teste gratuito.',
    alt: 'RealTTS — interpretação simultânea em tempo real para negócios transfronteiriços',
    keywords: 'interpretação simultânea,tradução de voz,tradução bidirecional,comércio internacional,tradução WeChat,interpretação Zoom,RealTTS',
    ogLocale: 'pt_BR',
    offers: { monthly: 'Mensal', quarterly: 'Trimestral', yearly: 'Anual' },
  },
  ar: {
    title: 'RealTTS — ترجمة فورية متزامنة | ترجمة صوتية ثنائية الاتجاه',
    desc: 'RealTTS برنامج ترجمة فورية متزامنة ثنائية الاتجاه يترجم الصوت في الوقت الفعلي عبر WeChat وWhatsApp وLINE وZoom وTelegram وغيرها، دون أن يثبّت عملاؤك أي تطبيق. لا تفقد صفقاتك بسبب حاجز اللغة.',
    short: 'ترجمة صوتية فورية ثنائية الاتجاه عبر WeChat وWhatsApp وLINE وZoom وغيرها. دون تثبيت أي تطبيق لدى عملائك. تبدأ من 20 دولارًا شهريًا، مع نسخة تجريبية مجانية.',
    alt: 'RealTTS — ترجمة فورية متزامنة للأعمال عبر الحدود',
    keywords: 'ترجمة فورية,ترجمة صوتية,ترجمة ثنائية الاتجاه,التجارة الدولية,ترجمة WeChat,ترجمة Zoom,RealTTS',
    ogLocale: 'ar_AR',
    offers: { monthly: 'شهري', quarterly: 'ربع سنوي', yearly: 'سنوي' },
  },
};

const urlFor = code => BASE + (code === 'zh-CN' ? '/' : `/${code}/`);

function extractObjectLiteral(src, name) {
  const m = new RegExp(`const\\s+${name}\\s*=\\s*`).exec(src);
  if (!m) throw new Error(`dictionary not found: ${name}`);
  const start = src.indexOf('{', m.index + m[0].length);
  let depth = 0, quote = null, line = false, block = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (line) { if (c === '\n') line = false; continue; }
    if (block) { if (c === '*' && n === '/') { block = false; i++; } continue; }
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = null; continue; }
    if (c === '/' && n === '/') { line = true; i++; continue; }
    if (c === '/' && n === '*') { block = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error(`unterminated dictionary: ${name}`);
}

function loadPacks(src) {
  const context = vm.createContext({});
  const dicts = {};
  for (const name of ['languages', ...DICTS]) {
    dicts[name] = vm.runInContext(`(${extractObjectLiteral(src, name)})`, context);
  }
  return LANGS.map(code => {
    const pack = { ...dicts.languages[code] };
    for (const name of DICTS) Object.assign(pack, dicts[name][code] || dicts[name].en || {});
    return { code, pack };
  });
}

function ensureMeta(doc, attrs, content) {
  let el = doc.querySelector(Object.entries(attrs).map(([k, v]) => `meta[${k}="${v}"]`).join(''));
  if (!el) {
    el = doc.createElement('meta');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function absolutizeRelativeUrls(doc) {
  const ATTRS = ['src', 'href', 'poster', 'data-src', 'data-poster', 'action'];
  for (const el of doc.querySelectorAll('*')) {
    for (const attr of ATTRS) {
      const v = el.getAttribute(attr);
      if (!v || /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\?)/i.test(v)) continue;
      el.setAttribute(attr, '/' + v.replace(/^\.\//, ''));
    }
  }
}

function rewriteCssAssetPaths(html) {
  return html.replace(/url\(\s*(['"]?)(?:\.\/)?\/?assets\//g, 'url($1/assets/');
}

function localizeHead(doc, code) {
  const seo = SEO[code];
  const pageUrl = urlFor(code);

  doc.documentElement.setAttribute('lang', code);
  doc.documentElement.setAttribute('dir', SEO_DIRS[code]);
  doc.documentElement.setAttribute('data-page-lang', code);

  doc.querySelector('title').textContent = seo.title;
  ensureMeta(doc, { name: 'description' }, seo.desc);
  ensureMeta(doc, { name: 'keywords' }, seo.keywords);

  const canonical = doc.querySelector('link[rel="canonical"]');
  canonical.setAttribute('href', pageUrl);

  for (const link of [...doc.querySelectorAll('link[hreflang]')]) link.remove();
  let cursor = canonical;
  for (const lang of [...LANGS, 'x-default']) {
    const link = doc.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', lang === 'x-default' ? urlFor('en') : urlFor(lang));
    cursor.parentNode.insertBefore(link, cursor.nextSibling);
    cursor = link;
  }

  ensureMeta(doc, { property: 'og:title' }, seo.title);
  ensureMeta(doc, { property: 'og:description' }, seo.short);
  ensureMeta(doc, { property: 'og:url' }, pageUrl);
  ensureMeta(doc, { property: 'og:locale' }, seo.ogLocale);
  ensureMeta(doc, { property: 'og:image' }, `${BASE}/og-image.png`);
  ensureMeta(doc, { property: 'og:image:alt' }, seo.alt);
  ensureMeta(doc, { name: 'twitter:title' }, seo.title);
  ensureMeta(doc, { name: 'twitter:description' }, seo.short);
  ensureMeta(doc, { name: 'twitter:image' }, `${BASE}/og-image.png`);
  ensureMeta(doc, { name: 'twitter:image:alt' }, seo.alt);

  for (const el of [...doc.querySelectorAll('meta[property="og:locale:alternate"]')]) el.remove();
  const ogLocale = doc.querySelector('meta[property="og:locale"]');
  let localeCursor = ogLocale;
  for (const lang of LANGS) {
    if (lang === code) continue;
    const el = doc.createElement('meta');
    el.setAttribute('property', 'og:locale:alternate');
    el.setAttribute('content', SEO[lang].ogLocale);
    localeCursor.parentNode.insertBefore(el, localeCursor.nextSibling);
    localeCursor = el;
  }
}

const SEO_DIRS = { 'zh-CN': 'ltr', 'zh-TW': 'ltr', en: 'ltr', ja: 'ltr', ko: 'ltr', ru: 'ltr', es: 'ltr', pt: 'ltr', ar: 'rtl' };

function localizeStructuredData(doc, code) {
  const script = doc.querySelector('script[type="application/ld+json"]');
  if (!script) return;
  const data = JSON.parse(script.textContent);
  const seo = SEO[code];
  const pageUrl = urlFor(code);

  data['@graph'] = data['@graph'].filter(node => !(node['@type'] === 'FAQPage' && code !== 'zh-CN'));
  for (const node of data['@graph']) {
    if (node['@type'] === 'WebSite') {
      node.url = BASE + '/';
      node.inLanguage = code;
      node.description = seo.desc;
    } else if (node['@type'] === 'Organization') {
      node.url = BASE + '/';
      node.logo = `${BASE}/assets/app.png`;
    } else if (node['@type'] === 'SoftwareApplication') {
      node.url = pageUrl;
      node.inLanguage = code;
      node.description = seo.desc;
      if (code !== 'zh-CN') node.applicationSubCategory = 'Real-time interpretation / voice translation';
      for (const offer of node.offers || []) {
        if (offer.name === '月付' || offer.name === 'Monthly') offer.name = seo.offers.monthly;
        else if (offer.name === '季付' || offer.name === 'Quarterly') offer.name = seo.offers.quarterly;
        else if (offer.name === '年付' || offer.name === 'Yearly') offer.name = seo.offers.yearly;
        delete offer.description;
      }
    }
  }
  script.textContent = JSON.stringify(data, null, 2);
}

function buildSitemap() {
  const alternates = LANGS.map(code =>
    `    <xhtml:link rel="alternate" hreflang="${code}" href="${urlFor(code)}"/>`).join('\n');
  const urls = LANGS.map(code => {
    const priority = code === 'zh-CN' ? '1.0' : code === 'en' ? '0.9' : '0.8';
    return `  <url>\n    <loc>${urlFor(code)}</loc>\n    <lastmod>${TODAY}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n` +
      `${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en')}"/>\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

const source = fs.readFileSync(SRC, 'utf8');
const packs = loadPacks(source);
const report = [];

for (const { code, pack } of packs) {
  const { document } = parseHTML(source);
  document.documentElement.setAttribute('data-page-lang', code);
  document.documentElement.setAttribute('dir', SEO_DIRS[code]);

  let translated = 0;
  const missing = new Set();
  if (code !== 'zh-CN') {
    for (const el of document.querySelectorAll('[data-realtts-i18n]')) {
      const key = el.getAttribute('data-realtts-i18n');
      const value = pack[key];
      if (typeof value === 'string' && value.trim() && value !== key) {
        el.innerHTML = value;
        translated++;
      } else {
        missing.add(key);
      }
    }
    absolutizeRelativeUrls(document);
  }

  localizeHead(document, code);
  localizeStructuredData(document, code);

  let html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n';
  if (code !== 'zh-CN') html = rewriteCssAssetPaths(html);

  const outDir = code === 'zh-CN' ? ROOT : path.join(ROOT, code);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  report.push({ code, translated, missing: [...missing] });
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(), 'utf8');

for (const r of report) {
  console.log(`${r.code.padEnd(6)} translated=${String(r.translated).padStart(3)} missing=${r.missing.length}` +
    (r.missing.length ? ` -> ${r.missing.slice(0, 8).join(',')}${r.missing.length > 8 ? '…' : ''}` : ''));
}
console.log(`sitemap.xml written with ${LANGS.length} URLs`);
