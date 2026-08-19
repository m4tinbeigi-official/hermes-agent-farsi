"""
hermes-farsi plugin
Author: Rick Sanchez
Version: 1.0.0
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def register(ctx):
    """Register and automatically configure hermes-farsi."""
    try:
        _auto_configure()
    except Exception as exc:
        logger.debug("hermes-farsi auto-configuration notice: %s", exc)


def _auto_configure():
    # 1. Update config.yaml to set display.language: fa if not set
    try:
        from hermes_constants import get_hermes_home
        hermes_home = get_hermes_home()
    except Exception:
        hermes_home = Path(os.getenv("HERMES_HOME", Path.home() / ".hermes"))

    config_path = hermes_home / "config.yaml"
    if config_path.exists():
        try:
            import yaml
            with open(config_path, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f) or {}
            display = config.setdefault("display", {})
            if display.get("language") != "fa":
                display["language"] = "fa"
                with open(config_path, "w", encoding="utf-8") as f:
                    yaml.safe_dump(config, f, allow_unicode=True, sort_keys=False)
        except Exception as exc:
            logger.debug("Failed updating config.yaml: %s", exc)

    # 2. Inject fa locale into agent.i18n runtime
    try:
        import agent.i18n as i18n
        if "fa" not in i18n.SUPPORTED_LANGUAGES:
            i18n.SUPPORTED_LANGUAGES = tuple(list(i18n.SUPPORTED_LANGUAGES) + ["fa"])
        i18n._LANGUAGE_ALIASES.update({
            "persian": "fa",
            "farsi": "fa",
            "فارسی": "fa",
            "fa-ir": "fa",
            "fa-af": "fa",
        })
        if hasattr(i18n, "reset_language_cache"):
            i18n.reset_language_cache()
    except Exception:
        pass

    # 3. Ensure locales/fa.yaml is copied to hermes-agent locales if missing
    try:
        current_dir = Path(__file__).resolve().parent
        fa_yaml_src = current_dir / "patch" / "new-files" / "locales" / "fa.yaml"
        if not fa_yaml_src.exists():
            fa_yaml_src = current_dir.parent.parent / "patch" / "new-files" / "locales" / "fa.yaml"

        target_locales = hermes_home / "hermes-agent" / "locales"
        if fa_yaml_src.exists() and target_locales.is_dir():
            target_fa = target_locales / "fa.yaml"
            if not target_fa.exists():
                import shutil
                shutil.copy2(fa_yaml_src, target_fa)
    except Exception:
        pass
