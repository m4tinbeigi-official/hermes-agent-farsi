#!/usr/bin/env bash
# ============================================================================
# hermes-farsi — نصب به‌عنوان یک پلاگین واقعی داشبورد Hermes Agent
# ============================================================================
# بدون نیاز به rebuild یا پچ‌کردن سورس: این اسکریپت پوشه پلاگین را در
# ~/.hermes/plugins/hermes-farsi کپی می‌کند و آن را در config.yaml فعال
# می‌کند. داشبورد در بارگذاری بعدی (رفرش صفحه) آن را خودکار لود می‌کند.
#
# پلاگین با یک MutationObserver متن‌های شناخته‌شده رابط کاربری را به فارسی
# ترجمه می‌کند، صفحه را راست‌چین می‌کند، و فونت وزیرمتن را بارگذاری می‌کند.
#
# کاربرد:
#   curl -fsSL https://raw.githubusercontent.com/<user>/hermes-agent-farsi/main/install-plugin.sh | bash
# ============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}→${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1" >&2; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_HOME_DIR="${HERMES_HOME:-$HOME/.hermes}"
PLUGINS_DIR="$HERMES_HOME_DIR/plugins"

if [ ! -d "$HERMES_HOME_DIR" ]; then
    err "پوشه Hermes ($HERMES_HOME_DIR) پیدا نشد — ابتدا Hermes Agent را نصب کنید."
    exit 1
fi

log "کپی پلاگین در $PLUGINS_DIR/hermes-farsi ..."
mkdir -p "$PLUGINS_DIR"
rm -rf "$PLUGINS_DIR/hermes-farsi"
cp -R "$SCRIPT_DIR/plugin/hermes-farsi" "$PLUGINS_DIR/hermes-farsi"
ok "فایل‌های پلاگین کپی شدند."

log "فعال‌سازی پلاگین در config.yaml ..."
CONFIG_FILE="$HERMES_HOME_DIR/config.yaml"
PYTHON_BIN="$HERMES_HOME_DIR/hermes-agent/venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

"$PYTHON_BIN" - "$CONFIG_FILE" <<'PYEOF'
import sys
try:
    import yaml
except ImportError:
    yaml = None

path = sys.argv[1]
name = "hermes-farsi"

if yaml is not None:
    try:
        with open(path) as f:
            config = yaml.safe_load(f) or {}
    except FileNotFoundError:
        config = {}
    plugins = config.setdefault("plugins", {})
    enabled = plugins.get("enabled") or []
    if name not in enabled:
        enabled.append(name)
    plugins["enabled"] = sorted(set(enabled))
    with open(path, "w") as f:
        yaml.safe_dump(config, f, allow_unicode=True, sort_keys=False)
    print("enabled via yaml:", plugins["enabled"])
else:
    # Fallback: naive append if PyYAML isn't available in this interpreter.
    import re
    try:
        with open(path) as f:
            text = f.read()
    except FileNotFoundError:
        text = ""
    if f"- {name}" not in text:
        if re.search(r"^plugins:\s*$", text, re.MULTILINE):
            text = re.sub(
                r"^(plugins:\s*\n(?:  .*\n)*?  enabled:\s*\n)",
                r"\1    - " + name + "\n",
                text,
                flags=re.MULTILINE,
            )
            if f"- {name}" not in text:
                text += f"\nplugins:\n  enabled:\n    - {name}\n"
        else:
            text += f"\nplugins:\n  enabled:\n    - {name}\n"
        with open(path, "w") as f:
            f.write(text)
    print("enabled via fallback append")
PYEOF
ok "پلاگین در پیکربندی فعال شد."

log "راه‌اندازی مجدد داشبورد تا پلاگین اسکن شود..."
if "$PYTHON_BIN" -m hermes_cli.main dashboard --stop >/dev/null 2>&1; then :; fi
(cd "$HERMES_HOME_DIR/hermes-agent" 2>/dev/null && "$PYTHON_BIN" -m hermes_cli.main dashboard --no-open >/tmp/hermes-farsi-plugin.log 2>&1 &) || true

echo
ok "نصب کامل شد!"
echo "  داشبورد را در http://localhost:9119 باز/رفرش کنید — رابط کاربری خودکار فارسی و راست‌چین می‌شود."
echo "  غیرفعال‌سازی: hermes plugins disable hermes-farsi"
