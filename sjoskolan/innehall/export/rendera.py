"""Gemensam rendering för exportörerna."""
import html
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import text as T  # noqa: E402

SJO = Path(__file__).resolve().parents[2]
LEDTRAD = {'begrepp': 'vad betyder storheterna?', 'metod': 'hur går jag vidare?', 'nasta-steg': 'nästa steg'}


def h(text):
    """Innehållstext till HTML (index som <sub>/<sup>)."""
    return T.html_text(text)


def attr(text):
    return html.escape(T.ren_text(text), quote=True)


def js(obj, indent=None):
    import json
    return json.dumps(obj, ensure_ascii=False, indent=indent)
