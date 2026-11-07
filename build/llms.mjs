import fs from 'node:fs';
import path from 'node:path';

// 只有 llms 文件独有的标题和生成句需要在这里维护；正文一律取自页面词典，
// 这样改价格、改功能、改 FAQ 时 llms 文件会跟着构建一起更新。
const COPY = {
  en: {
    languages: 'Supported languages',
    platform: 'Platform and compatibility',
    terms: 'Commercial terms',
    links: 'Official links',
    localizedVersions: 'Localized versions',
    homepage: 'Homepage',
    fullContent: 'Full product description (Markdown)',
    fullContentNote: 'Features, workflow, pricing, use cases, commercial terms and the complete FAQ in plain text.',
    salesEmail: 'Sales email',
    salesNote: 'Pre-purchase consultation, free trial and licensing. Serving customers worldwide.',
    sitemap: 'Sitemap',
    sitemapNote: 'All 9 language versions with hreflang alternates.',
    translationLangs: n => `Translates ${n} business languages, covering the major global trade markets, with more being added.`,
    uiLangs: (n, list) => `Interface available in ${n} languages: ${list}.`,
    platformLine: os => `Runs on ${os}, and on mobile for two-way live conversation anywhere.`,
  },
  'zh-CN': {
    languages: '支持语言',
    platform: '平台与兼容性',
    terms: '购买条款',
    links: '官方链接',
    localizedVersions: '多语言版本',
    homepage: '首页',
    fullContent: '完整产品说明（Markdown）',
    fullContentNote: '纯文本形式的功能、使用流程、定价、适用场景、购买条款与完整常见问题。',
    salesEmail: '销售邮箱',
    salesNote: '售前咨询、免费试用与授权购买，服务全球客户。',
    sitemap: '站点地图',
    sitemapNote: '全部 9 个语言版本及 hreflang 交替链接。',
    translationLangs: n => `支持 ${n} 种商务语言互译，覆盖主流跨境贸易市场，并将持续增加。`,
    uiLangs: (n, list) => `界面支持 ${n} 种语言：${list}。`,
    platformLine: os => `运行于 ${os}，并支持手机端随时随地双向实时对话。`,
  },
  'zh-TW': {
    languages: '支援語言',
    platform: '平台與相容性',
    terms: '購買條款',
    links: '官方連結',
    localizedVersions: '多語言版本',
    homepage: '首頁',
    fullContent: '完整產品說明（Markdown）',
    fullContentNote: '純文字形式的功能、使用流程、定價、適用場景、購買條款與完整常見問題。',
    salesEmail: '銷售郵箱',
    salesNote: '售前諮詢、免費試用與授權購買，服務全球客戶。',
    sitemap: '網站地圖',
    sitemapNote: '全部 9 個語言版本及 hreflang 交替連結。',
    translationLangs: n => `支援 ${n} 種商務語言互譯，涵蓋主流跨境貿易市場，並將持續增加。`,
    uiLangs: (n, list) => `介面支援 ${n} 種語言：${list}。`,
    platformLine: os => `運行於 ${os}，並支援手機端隨時隨地雙向即時對話。`,
  },
  ja: {
    languages: '対応言語',
    platform: 'プラットフォームと互換性',
    terms: '購入条件',
    links: '公式リンク',
    localizedVersions: '各言語版',
    homepage: 'ホームページ',
    fullContent: '製品詳細（Markdown）',
    fullContentNote: '機能、利用手順、料金、活用シーン、購入条件、FAQ 全文をプレーンテキストで収録。',
    salesEmail: '営業メール',
    salesNote: '購入前の相談、無料トライアル、ライセンス購入。世界中の顧客に対応。',
    sitemap: 'サイトマップ',
    sitemapNote: '9 つの言語版と hreflang 代替リンク。',
    translationLangs: n => `${n} 種類のビジネス言語を翻訳し、主要な越境貿易市場をカバー。今後も追加予定。`,
    uiLangs: (n, list) => `インターフェースは ${n} 言語に対応：${list}。`,
    platformLine: os => `${os} で動作し、スマートフォンでもどこでも双方向のリアルタイム会話が可能。`,
  },
  ko: {
    languages: '지원 언어',
    platform: '플랫폼 및 호환성',
    terms: '구매 조건',
    links: '공식 링크',
    localizedVersions: '언어별 버전',
    homepage: '홈페이지',
    fullContent: '전체 제품 설명(Markdown)',
    fullContentNote: '기능, 사용 절차, 요금, 활용 시나리오, 구매 조건 및 전체 FAQ를 일반 텍스트로 제공.',
    salesEmail: '영업 이메일',
    salesNote: '구매 전 상담, 무료 체험 및 라이선스 구매. 전 세계 고객 지원.',
    sitemap: '사이트맵',
    sitemapNote: '9개 언어 버전과 hreflang 대체 링크.',
    translationLangs: n => `${n}개 비즈니스 언어를 번역하며 주요 글로벌 무역 시장을 커버하고, 계속 추가될 예정.`,
    uiLangs: (n, list) => `인터페이스는 ${n}개 언어 지원: ${list}.`,
    platformLine: os => `${os}에서 실행되며, 모바일에서도 어디서나 양방향 실시간 대화 가능.`,
  },
  ru: {
    languages: 'Поддерживаемые языки',
    platform: 'Платформы и совместимость',
    terms: 'Условия покупки',
    links: 'Официальные ссылки',
    localizedVersions: 'Языковые версии',
    homepage: 'Главная страница',
    fullContent: 'Полное описание продукта (Markdown)',
    fullContentNote: 'Функции, порядок работы, цены, сценарии, условия покупки и полный FAQ в виде простого текста.',
    salesEmail: 'Эл. почта отдела продаж',
    salesNote: 'Консультация перед покупкой, бесплатный период и лицензирование. Обслуживаем клиентов по всему миру.',
    sitemap: 'Карта сайта',
    sitemapNote: 'Все 9 языковых версий с альтернативами hreflang.',
    translationLangs: n => `Переводит ${n} деловых языков, охватывая основные мировые торговые рынки; список пополняется.`,
    uiLangs: (n, list) => `Интерфейс доступен на ${n} языках: ${list}.`,
    platformLine: os => `Работает на ${os}, а также на мобильных устройствах — двусторонний живой разговор где угодно.`,
  },
  es: {
    languages: 'Idiomas compatibles',
    platform: 'Plataformas y compatibilidad',
    terms: 'Condiciones de compra',
    links: 'Enlaces oficiales',
    localizedVersions: 'Versiones por idioma',
    homepage: 'Página de inicio',
    fullContent: 'Descripción completa del producto (Markdown)',
    fullContentNote: 'Funciones, flujo de uso, precios, escenarios, condiciones de compra y FAQ completo en texto plano.',
    salesEmail: 'Correo de ventas',
    salesNote: 'Consulta previa a la compra, prueba gratuita y licencias. Atendemos a clientes de todo el mundo.',
    sitemap: 'Mapa del sitio',
    sitemapNote: 'Las 9 versiones de idioma con alternativas hreflang.',
    translationLangs: n => `Traduce ${n} idiomas de negocios, cubriendo los principales mercados del comercio mundial, y seguimos añadiendo más.`,
    uiLangs: (n, list) => `Interfaz disponible en ${n} idiomas: ${list}.`,
    platformLine: os => `Funciona en ${os} y también en el móvil para conversaciones bidireccionales en vivo desde cualquier lugar.`,
  },
  pt: {
    languages: 'Idiomas compatíveis',
    platform: 'Plataformas e compatibilidade',
    terms: 'Condições de compra',
    links: 'Links oficiais',
    localizedVersions: 'Versões por idioma',
    homepage: 'Página inicial',
    fullContent: 'Descrição completa do produto (Markdown)',
    fullContentNote: 'Recursos, fluxo de uso, preços, cenários, condições de compra e FAQ completo em texto simples.',
    salesEmail: 'E-mail de vendas',
    salesNote: 'Consultoria pré-compra, teste gratuito e licenciamento. Atendemos clientes no mundo todo.',
    sitemap: 'Mapa do site',
    sitemapNote: 'As 9 versões de idioma com alternativas hreflang.',
    translationLangs: n => `Traduz ${n} idiomas de negócios, cobrindo os principais mercados do comércio global, com mais a caminho.`,
    uiLangs: (n, list) => `Interface disponível em ${n} idiomas: ${list}.`,
    platformLine: os => `Funciona em ${os} e também no celular para conversas bidirecionais ao vivo em qualquer lugar.`,
  },
  ar: {
    languages: 'اللغات المدعومة',
    platform: 'المنصات والتوافق',
    terms: 'شروط الشراء',
    links: 'الروابط الرسمية',
    localizedVersions: 'النسخ بلغات أخرى',
    homepage: 'الصفحة الرئيسية',
    fullContent: 'وصف المنتج الكامل (Markdown)',
    fullContentNote: 'الميزات وخطوات الاستخدام والأسعار وسيناريوهات العمل وشروط الشراء والأسئلة الشائعة كاملةً بنص صريح.',
    salesEmail: 'البريد الإلكتروني للمبيعات',
    salesNote: 'استشارة قبل الشراء، ونسخة تجريبية مجانية، والترخيص. نخدم العملاء حول العالم.',
    sitemap: 'خريطة الموقع',
    sitemapNote: 'جميع النسخ التسع بلغاتها مع روابط hreflang البديلة.',
    translationLangs: n => `يترجم ${n} لغة أعمال تغطي أسواق التجارة العالمية الرئيسية، والمزيد قيد الإضافة.`,
    uiLangs: (n, list) => `الواجهة متاحة بـ ${n} لغات: ${list}.`,
    platformLine: os => `يعمل على ${os}، وكذلك على الهاتف المحمول لإجراء محادثة حية ثنائية الاتجاه في أي مكان.`,
  },
};

const clean = value => String(value ?? '')
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]*>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// 作为「**标题**: 正文」的前缀时去掉标题自带的句末标点，避免出现 ".**:" 这种连用。
const label = value => clean(value).replace(/[.。．]+$/, '');

const LIST_SEP = { 'zh-CN': '、', 'zh-TW': '、', ja: '、', ar: '، ' };

// 翻译语言数取自首页统计计数器：FAQ 文案里的数字与它不一致，计数器是唯一随页面更新的来源。
function statCount(source, key) {
  const i = source.indexOf(`data-realtts-i18n="${key}"`);
  if (i < 0) return null;
  const matches = [...source.slice(Math.max(0, i - 400), i).matchAll(/data-count="(\d+)"/g)];
  return matches.length ? Number(matches.pop()[1]) : null;
}

function readFacts(source) {
  const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(source)[1]);
  const app = ld['@graph'].find(node => node['@type'] === 'SoftwareApplication');
  const org = ld['@graph'].find(node => node['@type'] === 'Organization');
  const offers = app.offers || [];
  const currency = offers[0]?.priceCurrency || 'USD';
  return {
    os: app.operatingSystem,
    email: org.contactPoint?.[0]?.email,
    langCount: statCount(source, 'statLang'),
    prices: { monthly: offers[0]?.price, quarterly: offers[1]?.price, yearly: offers[2]?.price },
    money: value => (currency === 'USD' ? `$${value}` : `${value} ${currency}`),
  };
}

function renderLlms(code, ctx, full) {
  const t = COPY[code];
  const p = ctx.pack[code];
  const seo = ctx.seo[code];
  const out = [];
  const section = (title, lines) => out.push(`## ${title}`, '', ...lines, '');

  out.push('# RealTTS', '', `> ${clean(seo.desc)}`, '');
  out.push(clean(p.instantBody), '', clean(p.noappBody), '', clean(p.faq8A), '');

  if (full) {
    section(clean(p.navFeatures), [
      `- **${label(p.duplexTitle)}**: ${clean(p.duplexBody)}`,
      `- **${label(p.voiceTitle)}**: ${clean(p.voiceBody)}`,
      `- **${label(p.presetTitle)}**: ${clean(p.presetBody)}`,
      `- **${label(p.recordTitle)}**: ${clean(p.recordBody)}`,
    ]);
    section(clean(p.navWorkflow), [
      `1. **${label(p.step1Title)}**: ${clean(p.step1Body)}`,
      `2. **${label(p.step2Title)}**: ${clean(p.step2Body)}`,
      `3. **${label(p.step3Title)}**: ${clean(p.step3Body)}`,
    ]);
  }

  section(t.languages, [
    `- ${t.translationLangs(ctx.langCount)}`,
    `- ${t.uiLangs(ctx.langs.length, ctx.uiLabels.join(LIST_SEP[code] || ', '))}`,
  ]);

  section(t.platform, [
    `- ${t.platformLine(ctx.os)}`,
    `- ${clean(p.noappAppsLine)}`,
  ]);

  section(clean(p.dotPricing), [
    clean(p.pricingBody), '',
    `- **${clean(p.planMonthly)}**: ${ctx.money(ctx.prices.monthly)} ${clean(p.perMonthDevice)}`,
    `- **${clean(p.planQuarterly)}**: ${ctx.money(ctx.prices.quarterly)} ${clean(p.perQuarter)}`,
    `- **${clean(p.planYearly)}**: ${ctx.money(ctx.prices.yearly)} ${clean(p.perYear)}`,
    `- ${clean(p.pricingRoomNote)}`,
    ...(full ? [
      `- ${clean(p.priceFeat1)}`,
      `- ${clean(p.priceFeat2)}`,
      `- ${clean(p.priceFeat3)}`,
      `- ${clean(p.roomsHint)}`,
    ] : []),
  ]);

  section(clean(p.trialTitle), [
    `- ${clean(p.trialBody)}`,
    `- ${clean(p.trialNote)}`,
  ]);

  if (full) {
    section(clean(p.navScenarios), [
      `- **${label(p.pricingScene1Title)}**: ${clean(p.pricingScene1Body)}`,
      `- **${label(p.pricingScene2Title)}**: ${clean(p.pricingScene2Body)}`,
      `- **${label(p.pricingScene3Title)}**: ${clean(p.pricingScene3Body)}`,
      `- ${clean(p.priceOnlineChat)}`,
      `- ${clean(p.priceOnlineMeeting)}`,
      `- ${clean(p.priceOnsite)}`,
      `- ${clean(p.priceExhibition)}`,
      `- ${clean(p.priceMobile)}`,
      `- ${clean(p.priceMeetingRoom)}`,
    ]);

    out.push(`## ${clean(p.navFaq)}`, '');
    for (let i = 1; i <= 10; i++) {
      // 跳过第 6 条：其答案写「9 种」，与首页统计的翻译语言数冲突。
      // 语言覆盖由上面的 Supported languages 节给出权威数字，避免同一文件内自相矛盾。
      if (i === 6) continue;
      const q = clean(p[`faq${i}Q`]);
      const a = clean(p[`faq${i}A`]);
      if (q && a) out.push(`### ${q}`, '', a, '');
    }
  }

  section(t.terms, [`- ${clean(p.disclaimer)}`]);

  section(clean(p.dotContact), [
    `- [${t.salesEmail}](mailto:${ctx.email}): ${t.salesNote}`,
    `- ${clean(p.scanWechat)}: ${clean(p.scanWechatBody)}`,
  ]);

  out.push(`## ${t.links}`, '', `- [${t.homepage}](${ctx.urlFor(code)}): ${clean(seo.short)}`);
  if (!full) {
    out.push(`- [${t.fullContent}](${ctx.base}/${code}/llms-full.txt): ${t.fullContentNote}`);
  }
  out.push('');

  out.push(`## ${t.localizedVersions}`, '');
  for (const other of ctx.langs) {
    if (other === code) continue;
    out.push(`- [${ctx.pack[other].label}](${ctx.base}/${other}/llms.txt): ${clean(ctx.seo[other].title)}`);
  }
  out.push('');

  out.push('## Optional', '', `- [${t.sitemap}](${ctx.base}/sitemap.xml): ${t.sitemapNote}`);
  if (full) out.push(`- ${clean(p.copyright)}`);
  out.push('');

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export function writeLlmsFiles({ root, base, langs, packs, seo, source, urlFor }) {
  const pack = Object.fromEntries(packs.map(entry => [entry.code, entry.pack]));
  const ctx = {
    ...readFacts(source),
    base,
    langs,
    pack,
    seo,
    urlFor,
    uiLabels: langs.map(code => pack[code].label).filter(Boolean),
  };
  if (!ctx.langCount) throw new Error('statLang counter not found in index.html');

  const written = [];
  const emit = (relPath, content) => {
    const target = path.join(root, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    written.push(relPath);
  };

  for (const code of langs) {
    emit(`${code}/llms.txt`, renderLlms(code, ctx, false));
    emit(`${code}/llms-full.txt`, renderLlms(code, ctx, true));
  }
  // 根路径归英文，与 sitemap 的 x-default 一致；简体中文文本文件在 /zh-CN/ 下，
  // 因为根 HTML 页面本身是简体中文，但爬虫默认抓取的那份必须是英文。
  emit('llms.txt', renderLlms('en', ctx, false));
  emit('llms-full.txt', renderLlms('en', ctx, true));

  return written;
}

// 各语言页 head 里声明对应的纯文本版本，让本地化 llms 文件能被发现。
// 不带 hreflang：这是同一语言的「格式交替」，语言交替已由页面的 hreflang 集群表达；
// 重复的 hreflang 会让搜索引擎收到指向 text/plain 的语言替代页，可能被判为无效。
export function llmsLinkTags(code, base) {
  return [
    { rel: 'alternate', type: 'text/plain', href: `${base}/${code}/llms.txt`, title: 'RealTTS — LLM-readable summary' },
    { rel: 'alternate', type: 'text/markdown', href: `${base}/${code}/llms-full.txt`, title: 'RealTTS — full product description' },
  ];
}