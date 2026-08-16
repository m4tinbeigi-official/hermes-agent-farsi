/**
 * Generic Persian translator for config.yaml field keys/paths.
 *
 * CONFIG_SCHEMA (hermes_cli/web_server.py) has ~500 dot-path keys spanning
 * every subsystem (terminal, browser, tts/stt, discord, secrets, bedrock,
 * vertex...). Hand-writing 500 individual translations isn't maintainable
 * and drifts the moment a key is added upstream. Instead this maps the
 * ~500 distinct English word tokens that make up those keys, then composes
 * a label/description from any dot-path by translating word-by-word —
 * covering every current AND future config key with one dictionary.
 *
 * Brand/product names (OpenAI, Discord, Bitwarden...) and acronyms
 * (API, URL, TTL, MCP...) are intentionally left as-is: that's normal
 * practice in localized technical UIs (see VS Code's fa locale, which
 * keeps `settings.json` keys and vendor names in English too).
 */

const WORD_MAP: Record<string, string> = {
  abort: "لغو", accept: "پذیرش", access: "دسترسی", account: "حساب",
  ack: "تأیید", acked: "تأییدشده", actions: "عملیات", active: "فعال",
  adopt: "پذیرفتن", advisories: "هشدارها", after: "بعد از", agent: "ایجنت",
  agents: "ایجنت‌ها", aggregator: "تجمیع‌کننده", alias: "نام مستعار",
  allow: "اجازه", allowed: "مجاز", allowlist: "لیست مجاز", ambient: "محیطی",
  analytics: "تحلیل‌ها", any: "هر", api: "API", app: "برنامه",
  approval: "تأیید", approvals: "تأییدها", approve: "تأیید", archive: "بایگانی",
  args: "آرگومان‌ها", as: "به‌عنوان", assignee: "مسئول", assistant: "دستیار",
  attachment: "پیوست", audience: "مخاطب", audio: "صدا", auth: "احراز هویت",
  auto: "خودکار", autoraise: "بالابری خودکار", auxiliary: "کمکی",
  backend: "بک‌اند", backfill: "پرکردن تاریخچه", background: "پس‌زمینه",
  bashrc: "bashrc", cdp: "CDP", hint: "راهنمایی", ms: "میلی‌ثانیه",
  tier: "سطح", to: "به",
  backup: "پشتیبان", base: "پایه", basic: "ساده", beep: "بوق", bell: "زنگ",
  binary: "باینری", bit: "بیت", blocklist: "لیست مسدود", bots: "بات‌ها",
  browser: "مرورگر", buffer: "بافر", build: "ساخت", builtins: "داخلی‌ها",
  busy: "مشغول", bytes: "بایت", cache: "کش", caching: "کش‌کردن",
  call: "فراخوانی", callback: "کال‌بک", catalog: "کاتالوگ", changes: "تغییرات",
  channels: "کانال‌ها", char: "کاراکتر", chars: "کاراکتر", chats: "چت‌ها",
  checkpoints: "چک‌پوینت‌ها", child: "فرزند", children: "فرزندان",
  clarify: "شفاف‌سازی", client: "کلاینت", code: "کد", coding: "کدنویسی",
  collapse: "جمع‌شدن", cols: "ستون‌ها", command: "دستور", compact: "فشرده",
  complete: "کامل", completion: "تکمیل", compression: "فشرده‌سازی",
  computer: "کامپیوتر", concurrent: "همزمان", confirm: "تأیید",
  connect: "اتصال", consolidate: "تحکیم", container: "کانتینر",
  context: "زمینه", continuation: "ادامه", continue: "ادامه", copy: "کپی",
  cost: "هزینه", count: "تعداد", cpu: "CPU", created: "ایجادشده",
  credits: "اعتبار", cron: "زمان‌بندی", curator: "کیوریتور", cursor: "مکان‌نما",
  cwd: "پوشه کاری", daemon: "دیمون", dashboard: "داشبورد", days: "روز",
  decompose: "تجزیه", decomposer: "تجزیه‌کننده", default: "پیش‌فرض",
  delay: "تأخیر", delegation: "واگذاری", delete: "حذف", delivery: "تحویل",
  deny: "رد", depth: "عمق", describer: "توصیف‌کننده", desktop: "دسکتاپ",
  destructive: "مخرب", device: "دستگاه", dialog: "دیالوگ",
  diarize: "تفکیک گوینده", diffs: "تفاوت‌ها", dir: "پوشه", dirs: "پوشه‌ها",
  disable: "غیرفعال‌سازی", disabled: "غیرفعال", discovery: "کشف",
  disk: "دیسک", dispatch: "توزیع", display: "نمایش", dm: "پیام مستقیم",
  domains: "دامنه‌ها", download: "دانلود", drafts: "پیش‌نویس‌ها",
  drain: "تخلیه", driver: "درایور", duck: "کاهش صدا", duration: "مدت",
  echo: "پژواک", edit: "ویرایش", effort: "تلاش", enabled: "فعال",
  enforcement: "اجرا", engine: "موتور", env: "متغیر محیطی", environment: "محیط",
  ephemeral: "زودگذر", evaluate: "ارزیابی", events: "رویدادها", exact: "دقیق",
  exchanges: "تبادلات", execution: "اجرا", existing: "موجود",
  expected: "مورد انتظار", explainer: "توضیح‌دهنده", external: "خارجی",
  extra: "اضافی", extract: "استخراج", fail: "شکست", failure: "شکست",
  fallback: "جایگزین", fields: "فیلدها", file: "فایل", files: "فایل‌ها",
  filter: "فیلتر", final: "نهایی", first: "اول", flags: "پرچم‌ها",
  footer: "فوتر", for: "برای", force: "اجبار", format: "قالب",
  forward: "هدایت", free: "آزاد", fresh: "تازه", freshness: "تازگی",
  friendly: "دوستانه", full: "کامل", fx: "افکت", gain: "میزان صدا",
  gateway: "گیت‌وی", generation: "تولید", goals: "اهداف", gpu: "GPU",
  grace: "مهلت", grouping: "گروه‌بندی", guard: "محافظ",
  guardrail: "نرده محافظ", guardrails: "نرده‌های محافظ",
  guidance: "راهنمایی", guild: "گیلد", hard: "سخت", hash: "هش",
  history: "تاریخچه", home: "خانه", hooks: "هوک‌ها", host: "هاست",
  hours: "ساعت", hub: "مرکز", human: "انسانی", hygiene: "پاکیزگی",
  id: "شناسه", idempotent: "بدون تأثیر تکراری", identifier: "شناسه",
  idle: "بیکار", image: "تصویر", in: "در", inactivity: "عدم‌فعالیت",
  inbound: "ورودی", indicator: "نشانگر", inherit: "به‌ارث‌بردن",
  init: "مقداردهی اولیه", inline: "درون‌خطی", input: "ورودی", install: "نصب",
  installs: "نصب‌ها", instructions: "دستورالعمل‌ها", intent: "قصد",
  interactive: "تعاملی", interface: "رابط", interim: "موقت",
  interval: "بازه", ipv4: "IPv4", iterations: "تکرارها", jobs: "وظایف",
  json: "JSON", jwks: "JWKS", kanban: "کانبان", keep: "نگه‌داری",
  key: "کلید", labels: "برچسب‌ها", language: "زبان", last: "آخرین",
  lazy: "با تأخیر", length: "طول", level: "سطح", limit: "محدودیت",
  line: "خط", lines: "خطوط", live: "زنده", local: "محلی", log: "لاگ",
  logging: "ثبت لاگ", loop: "حلقه", loopback: "بازگشتی",
  managed: "مدیریت‌شده", markdown: "مارک‌داون", max: "حداکثر",
  mb: "مگابایت", mcp: "MCP", media: "رسانه", memory: "حافظه",
  mention: "منشن", mentions: "منشن‌ها", message: "پیام", messages: "پیام‌ها",
  min: "حداقل", minutes: "دقیقه", mirror: "بازتاب", modal: "سندباکس",
  mode: "حالت", model: "مدل", models: "مدل‌ها", monitor: "مانیتور",
  mount: "مانت", mutation: "تغییر", nas: "NAS", network: "شبکه",
  no: "خیر", non: "غیر", notice: "اعلان", notices: "اعلان‌ها",
  notifications: "اعلان‌ها", notify: "اطلاع‌رسانی", nudge: "یادآوری",
  nudges: "یادآوری‌ها", oauth: "OAuth", on: "روشن",
  onboarding: "راه‌اندازی اولیه", only: "فقط", open: "باز",
  orchestrator: "هماهنگ‌کننده", orphans: "یتیم‌ها", output: "خروجی",
  override: "بازنویسی", parallel: "موازی", passthrough: "عبور مستقیم",
  password: "رمز عبور", paste: "چسباندن", path: "مسیر", pct: "درصد",
  per: "در هر", persist: "ماندگاری", persistence: "ماندگاری",
  persistent: "پایدار", persona: "شخصیت", personality: "شخصیت",
  pet: "پت", phrases: "عبارت‌ها", pii: "اطلاعات شخصی", place: "جا",
  platform: "پلتفرم", platforms: "پلتفرم‌ها", policy: "سیاست",
  portal: "پورتال", pre: "پیش", prefill: "پرکردن اولیه", preset: "پریست",
  presets: "پریست‌ها", preview: "پیش‌نمایش", privacy: "حریم خصوصی",
  private: "خصوصی", probe: "کاوش", processing: "پردازش", profile: "پروفایل",
  progress: "پیشرفت", project: "پروژه", prompt: "پرامپت", prompts: "پرامپت‌ها",
  protect: "محافظت", provider: "ارائه‌دهنده", providers: "ارائه‌دهندگان",
  prune: "هرس", public: "عمومی", rate: "نرخ", ratio: "نسبت",
  reactions: "واکنش‌ها", read: "خواندن", reasoning: "استدلال",
  recent: "اخیر", record: "ضبط", recording: "ضبط", redact: "حذف اطلاعات حساس",
  ref: "مرجع", reference: "مرجع", refresh: "بروزرسانی", region: "منطقه",
  reload: "بارگذاری مجدد", render: "رندر", require: "الزام",
  response: "پاسخ", restart: "راه‌اندازی مجدد", restarts: "راه‌اندازی‌های مجدد",
  resume: "ازسرگیری", retention: "نگه‌داری", retries: "تلاش‌های مجدد",
  review: "بازبینی", rewrite: "بازنویسی", rich: "غنی", role: "نقش",
  rooms: "اتاق‌ها", rotate: "چرخش", run: "اجرا", runs: "اجراها",
  runtime: "زمان اجرا", same: "همان", sample: "نمونه", save: "ذخیره",
  scale: "مقیاس", scope: "دامنه", score: "امتیاز", search: "جستجو",
  seconds: "ثانیه", secret: "رمز", secrets: "رمزها", security: "امنیت",
  server: "سرور", service: "سرویس", session: "نشست", sessions: "نشست‌ها",
  shared: "مشترک", shell: "شل", shortcut: "میانبر", show: "نمایش",
  silence: "سکوت", size: "حجم", skills: "مهارت‌ها", skin: "پوسته",
  skip: "صرف‌نظر", slash: "اسلش", slug: "شناسه کوتاه",
  snapshots: "عکس‌های لحظه‌ای", source: "منبع", spawn: "ایجاد",
  specifier: "تعیین‌کننده", speech: "گفتار", stale: "بیات", status: "وضعیت",
  steer: "هدایت", stop: "توقف", strategy: "استراتژی", stream: "جریان",
  streaming: "پخش جریانی", strict: "سخت‌گیرانه", style: "سبک",
  subagent: "زیرایجنت", summary: "خلاصه", system: "سیستم", tab: "تب",
  tag: "برچسب", tags: "برچسب‌ها", target: "هدف", task: "وظیفه",
  telemetry: "تله‌متری", template: "قالب", term: "پایان", terminal: "ترمینال",
  text: "متن", theme: "پوسته", thread: "موضوع", threshold: "آستانه",
  tick: "چرخه", timeout: "زمان انتظار", timestamp: "زمان‌مهر",
  timestamps: "زمان‌مهرها", timezone: "منطقه زمانی", title: "عنوان",
  token: "توکن", tokens: "توکن‌ها", tool: "ابزار", tools: "ابزارها",
  toolsets: "مجموعه‌ابزارها", total: "مجموع", trace: "ردیابی",
  traces: "ردیابی‌ها", transcripts: "متن‌نویسی‌ها", transient: "گذرا",
  transport: "انتقال", triage: "اولویت‌بندی", trust: "اعتماد",
  ttl: "TTL", turn: "نوبت", turns: "نوبت‌ها", unicode: "یونیکد",
  unsafe: "ناامن", update: "بروزرسانی", updates: "بروزرسانی‌ها",
  url: "آدرس", urls: "آدرس‌ها", use: "استفاده", user: "کاربر",
  username: "نام کاربری", vacuum: "پاک‌سازی", vars: "متغیرها",
  verifier: "تأییدکننده", verify: "تأیید", version: "نسخه", vision: "بینایی",
  voice: "صدا", volumes: "حجم‌ها", wait: "انتظار", warn: "هشدار",
  warning: "هشدار", warnings: "هشدارها", web: "وب", website: "وب‌سایت",
  window: "پنجره", worker: "کارگر", workspace: "فضای کاری", wrap: "پوشش",
  write: "نوشتن", zero: "صفر",
  // brand / product names — kept as their canonical spelling
  bedrock: "Bedrock", bitwarden: "Bitwarden", camofox: "Camofox",
  chronos: "Chronos", cli: "CLI", cua: "CUA", codex: "Codex",
  daytona: "Daytona", discord: "دیسکورد", docker: "Docker", edge: "Edge",
  electron: "Electron", elevenlabs: "ElevenLabs", gemini: "Gemini",
  gpt55: "GPT-5.5", lsp: "LSP", matrix: "Matrix", mattermost: "Mattermost",
  mistral: "Mistral", moa: "MOA", neutts: "NeuTTS",
  onepassword: "1Password", openai: "OpenAI",
  openrouter: "OpenRouter", piper: "Piper", singularity: "Singularity",
  slack: "اسلک", stt: "تبدیل گفتار به متن", telegram: "تلگرام",
  tirith: "Tirith", tts: "تبدیل متن به گفتار", tui: "TUI", vertex: "Vertex",
  xai: "xAI",
};

function translateWord(word: string): string {
  const lower = word.toLowerCase();
  return WORD_MAP[lower] || word.charAt(0).toUpperCase() + word.slice(1);
}

function faSegment(segment: string): string {
  return segment
    .split("_")
    .filter(Boolean)
    .map(translateWord)
    .join(" ");
}

/** Persian label for a config field, derived from its dot-path key. */
export function faFieldLabel(fullKey: string): string {
  const last = fullKey.split(".").pop() ?? fullKey;
  return faSegment(last);
}

/** Persian breadcrumb-style description for a config field's full path. */
export function faFieldDescription(fullKey: string): string {
  return fullKey.split(".").map(faSegment).join(" ← ");
}
