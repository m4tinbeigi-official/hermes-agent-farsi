#!/usr/bin/env bash
# ============================================================================
# hermes-agent-farsi — نصب یک‌کلیکی بومی‌سازی فارسی برای Hermes Agent
# ============================================================================
# این اسکریپت یک نصب موجود Hermes Agent (https://github.com/NousResearch/hermes-agent)
# را با موارد زیر بومی‌سازی می‌کند:
#   - ترجمه کامل داشبورد وب به فارسی (تمام صفحات + پیکربندی پویا)
#   - راست‌چین‌سازی خودکار (RTL) کل رابط کاربری
#   - فونت وزیرمتن (Vazirmatn) به یاد صابر راستی‌کردار به‌صورت محلی
#   - ترجمه پیام‌های CLI/گیت‌وی (تأیید دستورات، پاسخ‌های تلگرام و ...)
#
# کاربرد:
#   curl -fsSL https://raw.githubusercontent.com/m4tinbeigi-official/hermes-agent-farsi/main/install.sh | bash
#
# یا به‌صورت محلی:
#   ./install.sh [مسیر نصب هرمس]
#
# پیش‌نیاز: Hermes Agent باید از قبل نصب شده باشد (hermes-agent.nousresearch.com)
# ============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${CYAN}→${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1" >&2; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_DIR="${1:-${HERMES_HOME:-$HOME/.hermes}/hermes-agent}"

if [ ! -d "$HERMES_DIR" ]; then
    err "نصب Hermes Agent در مسیر $HERMES_DIR پیدا نشد."
    echo "  اگر جای دیگری نصب کرده‌اید، مسیر را به‌عنوان آرگومان بدهید:"
    echo "    ./install.sh /path/to/hermes-agent"
    exit 1
fi

log "نصب Hermes Agent در $HERMES_DIR پیدا شد."

TMP_CLONE=""
cleanup() {
    if [ -n "$TMP_CLONE" ] && [ -d "$TMP_CLONE" ]; then
        rm -rf "$TMP_CLONE"
    fi
}
trap cleanup EXIT

SOURCE_DIR="$SCRIPT_DIR"
if [ ! -d "$SOURCE_DIR/patch" ]; then
    log "در حال دانلود فایل‌های پچ از مخزن گیت‌هاب..."
    TMP_CLONE="$(mktemp -d)"
    git clone --depth=1 https://github.com/m4tinbeigi-official/hermes-agent-farsi.git "$TMP_CLONE" >/dev/null 2>&1
    SOURCE_DIR="$TMP_CLONE"
fi

# --- گیت‌وی در حال اجرا را متوقف می‌کنیم تا فایل‌ها با خیال راحت جایگزین شوند ---
GATEWAY_WAS_RUNNING=false
if command -v hermes >/dev/null 2>&1 && hermes status 2>/dev/null | grep -qi "running"; then
    GATEWAY_WAS_RUNNING=true
fi

# --- ۱) کپی فایل‌های جدید ---
log "کپی فایل‌های جدید (ترجمه‌ها، فونت، مترجم پیکربندی)..."
mkdir -p "$HERMES_DIR/locales"
mkdir -p "$HERMES_DIR/web/src/i18n"
mkdir -p "$HERMES_DIR/web/src/lib"
mkdir -p "$HERMES_DIR/web/public/fonts-fa"

cp "$SOURCE_DIR/patch/new-files/locales/fa.yaml"              "$HERMES_DIR/locales/fa.yaml"
cp "$SOURCE_DIR/patch/new-files/web/src/i18n/fa.ts"            "$HERMES_DIR/web/src/i18n/fa.ts"
cp "$SOURCE_DIR/patch/new-files/web/src/lib/faConfigLabels.ts" "$HERMES_DIR/web/src/lib/faConfigLabels.ts"
cp "$SOURCE_DIR/patch/new-files/web/public/fonts-fa/"*.woff2   "$HERMES_DIR/web/public/fonts-fa/"
ok "فایل‌های جدید کپی شدند."

# --- ۲) اعمال پچ روی فایل‌های موجود ---
log "اعمال تغییرات روی فایل‌های موجود..."
cd "$HERMES_DIR"
if git apply --check "$SOURCE_DIR/patch/persian-localization.diff" 2>/dev/null; then
    git apply "$SOURCE_DIR/patch/persian-localization.diff"
    ok "پچ با موفقیت اعمال شد."
elif git apply --reverse --check "$SOURCE_DIR/patch/persian-localization.diff" 2>/dev/null; then
    ok "پچ از قبل روی فایل‌ها اعمال شده است."
elif patch -p1 --dry-run -N < "$SOURCE_DIR/patch/persian-localization.diff" >/dev/null 2>&1; then
    patch -p1 -N < "$SOURCE_DIR/patch/persian-localization.diff"
    ok "پچ با موفقیت اعمال شد (patch)."
else
    warn "اعمال خودکار پچ ممکن نشد — احتمالاً نسخه Hermes شما با نسخه‌ای که این پچ رویش ساخته شده فرق دارد."
    warn "می‌توانید تغییرات را دستی از patch/persian-localization.diff اعمال کنید، یا یک ایشو باز کنید."
    exit 1
fi

# --- ۳) تنظیم زبان پیش‌فرض در config.yaml ---
CONFIG_FILE="${HERMES_HOME:-$HOME/.hermes}/config.yaml"
PYTHON_BIN="$HERMES_DIR/venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

if ! grep -q "language: fa" "$CONFIG_FILE" 2>/dev/null; then
    log "تنظیم زبان پیش‌فرض روی فارسی در config.yaml..."
    "$PYTHON_BIN" - "$CONFIG_FILE" <<'PYEOF'
import sys
try:
    import yaml
except ImportError:
    yaml = None

path = sys.argv[1]
if yaml is not None:
    try:
        with open(path) as f:
            config = yaml.safe_load(f) or {}
    except FileNotFoundError:
        config = {}
    display = config.setdefault("display", {})
    display["language"] = "fa"
    with open(path, "w") as f:
        yaml.safe_dump(config, f, allow_unicode=True, sort_keys=False)
else:
    import re
    try:
        with open(path) as f:
            text = f.read()
    except FileNotFoundError:
        text = ""
    if re.search(r"^display:\s*$", text, re.MULTILINE):
        text = re.sub(
            r"^(display:\s*\n)",
            r"\1  language: fa\n",
            text,
            flags=re.MULTILINE,
        )
    else:
        text += "\ndisplay:\n  language: fa\n"
    with open(path, "w") as f:
        f.write(text)
PYEOF
    ok "زبان فارسی در config.yaml فعال شد."
else
    ok "زبان فارسی از قبل در config.yaml تنظیم شده بود."
fi

# --- ۴) بازساخت رابط ترمینال/TUI (فارسی‌سازی حروف و راست‌چین در چت و ترمینال) ---
if [ -f "$HERMES_DIR/ui-tui/scripts/build.mjs" ]; then
    log "در حال بازساخت رابط کاربری ترمینال (ui-tui)..."
    if command -v node >/dev/null 2>&1; then
        node "$HERMES_DIR/ui-tui/scripts/build.mjs" >/dev/null 2>&1 || warn "بازساخت خودکار ui-tui ناموفق بود."
        ok "رابط کاربری ترمینال و چت (ui-tui) بازسازی شد."
    fi
fi

# --- ۵) بازساخت داشبورد وب ---
log "در حال بازساخت داشبورد وب (ممکن است کمی طول بکشد)..."
HERMES_BIN="$HERMES_DIR/venv/bin/python"
if [ ! -x "$HERMES_BIN" ]; then
    HERMES_BIN="python3"
fi

if "$HERMES_BIN" -m hermes_cli.main dashboard --stop >/dev/null 2>&1; then :; fi
(cd "$HERMES_DIR" && "$HERMES_BIN" -m hermes_cli.main dashboard --no-open >/tmp/hermes-farsi-dashboard-build.log 2>&1 &) || true
sleep 2
log "بازساخت داشبورد در پس‌زمینه شروع شد. برای دیدن پیشرفت:"
echo "    tail -f /tmp/hermes-farsi-dashboard-build.log"

# --- ۶) راه‌اندازی مجدد گیت‌وی (در صورت اجرا بودن) ---
if [ "$GATEWAY_WAS_RUNNING" = true ] && command -v hermes >/dev/null 2>&1; then
    log "راه‌اندازی مجدد گیت‌وی..."
    hermes gateway restart >/dev/null 2>&1 || warn "راه‌اندازی مجدد خودکار گیت‌وی ناموفق بود؛ دستی اجرا کنید: hermes gateway restart"
fi

echo
ok "نصب کامل شد!"
echo "  🌸 استفاده شده از فونت وزیرمتن به یاد صابر راستی‌کردار"
echo "  داشبورد را در http://localhost:9119 باز کنید (چند ثانیه صبر کنید تا build تمام شود)."
echo "  اگر زبان به‌طور خودکار فارسی نبود، از دکمه زبان (پایین سایدبار) «فارسی» را انتخاب کنید."
