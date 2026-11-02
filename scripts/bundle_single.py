#!/usr/bin/env python3
"""Bundle the site into ONE self-contained HTML file (no build tools needed).

Handles the module style this project uses: `import { a, b as c } from './x';` and `export { a, b };`.
Usage: python3 scripts/bundle_single.py out.html
"""
import base64, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
IMPORT = re.compile(r"^import\s*\{([^}]*)\}\s*from\s*'([^']+)';[ \t]*\n", re.M)
CSS_IMPORT = re.compile(r"^import\s*'([^']+\.css)';[ \t]*\n", re.M)
EXPORT = re.compile(r"^export\s*\{([^}]*)\};[ \t]*\n?", re.M)

def resolve(frm: Path, spec: str) -> Path:
    p = (frm.parent / spec).resolve()
    return p if p.suffix == '.js' else p.with_suffix('.js')

order, seen, css = [], set(), []
def visit(path: Path):
    if path in seen:
        return
    seen.add(path)
    text = path.read_text()
    for m in CSS_IMPORT.finditer(text):
        css.append((path.parent / m.group(1)).resolve().read_text())
    for m in IMPORT.finditer(text):
        visit(resolve(path, m.group(2)))
    order.append(path)

visit(SRC / 'main.js')

def key(p: Path) -> str:
    return str(p.relative_to(SRC))

parts = []
for path in order:
    text = path.read_text()
    text = CSS_IMPORT.sub('', text)
    text = IMPORT.sub(lambda m: "const {%s} = __M[%s];\n" % (
        ', '.join(re.sub(r'\s+as\s+', ': ', x.strip()) for x in m.group(1).split(',') if x.strip()),
        json.dumps(key(resolve(path, m.group(2))))), text)
    exports = []
    def grab(m):
        for x in m.group(1).split(','):
            x = x.strip()
            if x:
                a, _, b = x.partition(' as ')
                exports.append((b or a).strip() + ': ' + a.strip() if b else a)
        return ''
    text = EXPORT.sub(grab, text)
    parts.append("__M[%s] = (() => {\n%s\nreturn { %s };\n})();" % (json.dumps(key(path)), text, ', '.join(exports)))

js = "const __M = {};\n" + "\n".join(parts)
html = (ROOT / 'index.html').read_text()
logo = 'data:image/svg+xml;base64,' + base64.b64encode((ROOT / 'public' / 'logo.svg').read_bytes()).decode()
html = html.replace('./logo.svg', logo)
html = html.replace('<script type="module" src="/src/main.js"></script>', '')
safe = ":root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\n"
html = html.replace('</head>', '<style>\n' + safe + '\n'.join(css) + '\n</style>\n</head>', 1)
html = html.replace('</body>', '<script>\n' + js.replace('</script', '<\\/script') + '\n</script>\n</body>', 1)
Path(sys.argv[1] if len(sys.argv) > 1 else 'lang-single.html').write_text(html)
print('wrote', sys.argv[1] if len(sys.argv) > 1 else 'lang-single.html', len(html), 'bytes,', len(order), 'modules')
