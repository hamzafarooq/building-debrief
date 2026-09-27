# Renders the .claude/ tree with the vault plugin expanded, for Lesson 4 step 1.
import html
ROWS = [
  (0, '.claude/',        'fold', None),
  (1, 'agent-memory/',   'fold', 'filled in as you run'),
  (1, 'agents/',         'fold', 'Lessons 2 and 3'),
  (2, 'faq-writer.md',   'md',   None),
  (2, 'flashcard-writer.md','md',None),
  (2, 'quiz-writer.md',  'md',   None),
  (2, 'renderer.md',     'md',   None),
  (2, 'report-writer.md','md',   None),
  (1, 'skills/',         'fold', 'Lessons 1 and 2'),
  (2, 'beautiful-html/', 'fold', None),
  (2, 'debrief/',        'fold', None),
  (2, 'debrief-team/',   'fold', None),
  (2, 'recap-email/',    'fold', None),
  (2, 'vault/',          'vfold','the plugin you are building', 1),
  (3, '.claude-plugin/', 'vfold',None),
  (4, 'plugin.json',     'vjson',None, 2),
  (3, 'agents/',         'vfold',None),
  (4, 'wiki-keeper.md',  'vmd',  None, 3),
  (3, 'skills/',         'vfold',None),
  (4, 'wiki-update/',    'vfold',None),
  (5, 'SKILL.md',        'vmd',  None, 4),
  (3, 'README.md',       'vmd',  None),
  (1, 'settings.json',   'json', 'the agent-teams flag'),
]
ANN = [
  ('The plugin lives beside your own skills, in a folder of its own.'),
  ('The manifest. Its presence is what turns an ordinary folder into a plugin Claude can switch on and off by name.'),
  ('The plugin brings its own agent, which is the only thing allowed to write in the vault.'),
  ('And its own skill. The command becomes <b>/vault:wiki-update</b>, prefixed with the plugin name so it cannot clash with yours.'),
]
ICON = {'fold':'#8AB4F8','md':'#B9B9B9','json':'#E3C26A','vfold':'#E39BC0','vjson':'#E3C26A','vmd':'#E39BC0'}
rows = []
for r in ROWS:
    ind, name, kind, note = r[0], r[1], r[2], r[3]
    pin = r[4] if len(r) > 4 else None
    if ind < 0:
        rows.append('<div class="row spacer"></div>'); continue
    v = kind.startswith('v')
    rows.append(
      f'<div class="row{" v" if v else ""}" style="padding-left:{14+ind*20}px">'
      f'<span class="ic" style="background:{ICON[kind]}"></span>'
      f'<span class="nm{" b" if name.endswith("/") else ""}">{html.escape(name)}</span>'
      + (f'<span class="note">{html.escape(note)}</span>' if note else '')
      + (f'<span class="pin">{pin}</span>' if pin else '')
      + '</div>')
anns = ''.join(f'<div class="ann"><span class="num">{i+1}</span>{t}</div>' for i, t in enumerate(ANN))
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAF9F5;font-family:"DM Sans",system-ui,sans-serif}
.stage{position:relative;width:1180px;height:560px;background:#FAF9F5;padding:16px}
.card{position:absolute;left:16px;top:16px;width:560px;bottom:16px;background:#fff;border:1px solid #E4E0D6;border-radius:12px;overflow:hidden}
.card h4{font-family:"JetBrains Mono";font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8B877D;padding:12px 14px 8px;font-weight:500}
.row{display:flex;align-items:center;gap:7px;height:21px;font-family:"JetBrains Mono";font-size:11.5px;color:#2b2b2b;position:relative}
.row.spacer{height:12px}
.row.v{background:#FDF0F6}
.ic{width:11px;height:11px;border-radius:2px;flex:none;display:block}
.nm.b{font-weight:600}
.note{font-family:"DM Sans";font-size:10.5px;color:#A5A199;margin-left:8px}
.pin{position:absolute;right:12px;width:18px;height:18px;border-radius:50%;background:#1b1a17;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono"}
.gut{position:absolute;left:600px;top:16px;width:564px;display:flex;flex-direction:column;gap:11px}
.ann{position:relative;background:#fff;border:1px solid #CFCABE;border-radius:9px;padding:9px 12px 9px 36px;font-size:12.5px;line-height:1.45;color:#1b1a17;box-shadow:0 1px 6px rgba(0,0,0,.05)}
.ann .num{position:absolute;left:9px;top:9px;width:18px;height:18px;border-radius:50%;background:#1b1a17;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono"}
.ann b{font-family:"JetBrains Mono";font-size:11.5px;font-weight:500}
"""
doc = ('<!doctype html><html><head><meta charset="utf-8">'
 '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">'
 f'<style>{CSS}</style></head><body><div class="stage">'
 f'<div class="card"><h4>what .claude/ looks like now</h4>{"".join(rows)}</div>'
 f'<div class="gut">{anns}</div></div></body></html>')
open('claude-folder.html', 'w').write(doc)
print('wrote claude-folder.html')
