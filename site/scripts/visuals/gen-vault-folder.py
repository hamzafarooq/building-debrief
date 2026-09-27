# Renders vault/ as it looks after the first ingest, for Lesson 4 step 5.
import html
ROWS = [
  (0, 'vault/',        'vfold', None),
  (1, 'README.md',     'vmd',  'the rules you wrote in step 4'),
  (1, 'index.md',      'vmd',  None, 3),
  (1, 'log.md',        'vmd',  None, 4),
  (1, 'concepts/',     'vfold','one page per idea', 1),
  (2, 'agent.md',      'vmd',  None),
  (2, 'ai-backend.md', 'vmd',  None),
  (2, 'ai-feature-spec.md','vmd',None),
  (2, 'backend.md',    'vmd',  None),
  (2, 'claude-code.md','vmd',  None),
  (2, 'claude-md.md',  'vmd',  None),
  (2, 'ctl.md',        'vmd',  None),
  (2, 'front-end.md',  'vmd',  None),
  (2, 'harness.md',    'vmd',  None),
  (2, 'infrastructure-and-data-layer.md','vmd',None),
  (2, 'llm-call.md',   'vmd',  None),
  (2, 'skill-md.md',   'vmd',  None),
  (1, 'people/',       'vfold','instructors, and students who recur'),
  (2, 'aishwarya-ashok.md','vmd',None),
  (2, 'hamza-farooq.md','vmd', None),
  (1, 'sessions/',     'vfold',None),
  (2, 'module-02.md',  'vmd',  None, 2),
]
ANN = [
  'One page per idea an instructor explained. Module 03 adds a line to these pages rather than creating a second copy.',
  'What one session covered, linking out to the concept pages it touched.',
  'Every page in the vault, by category. The keeper rewrites this on each ingest.',
  'One entry per ingest: which pages changed, not what was taught.',
]
ICON = {'vfold':'#E39BC0','vmd':'#E39BC0'}
rows = []
for r in ROWS:
    ind, name, kind, note = r[0], r[1], r[2], r[3]
    pin = r[4] if len(r) > 4 else None
    rows.append(
      f'<div class="row v" style="padding-left:{14+ind*20}px">'
      f'<span class="ic" style="background:{ICON[kind]}"></span>'
      f'<span class="nm{" b" if name.endswith("/") else ""}">{html.escape(name)}</span>'
      + (f'<span class="note">{html.escape(note)}</span>' if note else '')
      + (f'<span class="pin">{pin}</span>' if pin else '')
      + '</div>')
anns = ''.join(f'<div class="ann"><span class="num">{i+1}</span>{t}</div>' for i, t in enumerate(ANN))
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAF9F5;font-family:"DM Sans",system-ui,sans-serif}
.stage{position:relative;width:1180px;height:540px;background:#FAF9F5;padding:16px}
.card{position:absolute;left:16px;top:16px;width:560px;bottom:16px;background:#fff;border:1px solid #E4E0D6;border-radius:12px;overflow:hidden}
.card h4{font-family:"JetBrains Mono";font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8B877D;padding:12px 14px 8px;font-weight:500}
.row{display:flex;align-items:center;gap:7px;height:21px;font-family:"JetBrains Mono";font-size:11.5px;color:#2b2b2b;position:relative}
.row.v{background:#FDF0F6}
.ic{width:11px;height:11px;border-radius:2px;flex:none;display:block}
.nm.b{font-weight:600}
.note{font-family:"DM Sans";font-size:10.5px;color:#A5A199;margin-left:8px}
.pin{position:absolute;right:12px;width:18px;height:18px;border-radius:50%;background:#1b1a17;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono"}
.gut{position:absolute;left:600px;top:16px;width:564px;display:flex;flex-direction:column;gap:11px}
.ann{position:relative;background:#fff;border:1px solid #CFCABE;border-radius:9px;padding:9px 12px 9px 36px;font-size:12.5px;line-height:1.45;color:#1b1a17;box-shadow:0 1px 6px rgba(0,0,0,.05)}
.ann .num{position:absolute;left:9px;top:9px;width:18px;height:18px;border-radius:50%;background:#1b1a17;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono"}
"""
doc = ('<!doctype html><html><head><meta charset="utf-8">'
 '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">'
 f'<style>{CSS}</style></head><body><div class="stage">'
 f'<div class="card"><h4>vault/ after one ingest</h4>{"".join(rows)}</div>'
 f'<div class="gut">{anns}</div></div></body></html>')
open('vault-folder.html', 'w').write(doc)
print('wrote vault-folder.html')
