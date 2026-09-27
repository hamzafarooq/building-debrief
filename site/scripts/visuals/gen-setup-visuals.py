import json, html

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#faf8f4;font-family:"DM Sans",system-ui,sans-serif}
.stage{position:relative;width:1180px;height:580px;background:#faf8f4}
.vs{position:absolute;left:0;top:0;width:850px;height:580px;background:#fff;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.13);overflow:hidden;border:1px solid #e0dcd2;display:flex;flex-direction:column}
.tb{height:34px;background:#f3f3f3;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;padding:0 12px;flex:none}
.tl{display:flex;gap:6px}.tl i{width:11px;height:11px;border-radius:50%;display:block}
.tl i:nth-child(1){background:#ff5f57}.tl i:nth-child(2){background:#febc2e}.tl i:nth-child(3){background:#28c840}
.tbt{font-size:11.5px;color:#5f5f5f;margin:0 auto;padding-right:40px}
.mb{height:26px;background:#f3f3f3;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;padding:0 10px;gap:13px;flex:none;font-size:11.5px;color:#3c3c3c}
.body{flex:1;display:flex;min-height:0}
.act{width:44px;background:#f3f3f3;border-right:1px solid #e5e5e5;display:flex;flex-direction:column;align-items:center;padding-top:11px;gap:16px;flex:none}
.act i{width:19px;height:19px;display:block;border-radius:3px;background:#cacaca}
.act i.on{background:#0a65c2}
.side{width:215px;background:#f8f8f8;border-right:1px solid #e5e5e5;flex:none;overflow:hidden}
.side h4{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#6f6f6f;padding:10px 12px 5px;font-weight:600}
.side .fld{font-size:11.5px;color:#2b2b2b;padding:3px 12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}
.row{font-size:11.5px;color:#333;padding:2.5px 12px;display:flex;align-items:center;gap:6px}
.row.sel{background:#e4e6f1}
.row .ch{color:#888;font-size:9px;width:8px;flex:none}
.row .ic{width:12px;height:12px;border-radius:2px;flex:none;display:block}
.ic.fold{background:#8ab4f8}.ic.md{background:#b9b9b9}.ic.vtt{background:#b39ddb}.ic.json{background:#e3c26a}
.ed{flex:1;display:flex;flex-direction:column;background:#fff;min-width:0}
.ed .tabs{height:28px;background:#f3f3f3;border-bottom:1px solid #e5e5e5;display:flex;flex:none}
.ed .tab{font-size:11.5px;color:#333;background:#fff;border-right:1px solid #e5e5e5;padding:0 13px;display:flex;align-items:center;gap:6px}
.ed .code{flex:1;padding:9px 0;font-family:"JetBrains Mono";font-size:11px;line-height:1.62;color:#333;overflow:hidden}
.ed .code div{padding:0 12px 0 46px;position:relative;white-space:pre}
.ed .code div::before{content:attr(data-n);position:absolute;left:0;width:34px;text-align:right;color:#b8b8b8;font-size:10px}
.h1{color:#0a65c2;font-weight:500}.h2{color:#0a65c2}.dim{color:#8d8d8d}.str{color:#0a7c42}
.blank .ed{align-items:center;justify-content:center}
/* terminal */
.term{height:206px;background:#fff;border-top:1px solid #e5e5e5;flex:none;display:flex;flex-direction:column}
.term .tt{height:26px;background:#f3f3f3;display:flex;align-items:center;gap:15px;padding:0 12px;font-size:9.5px;letter-spacing:.07em;color:#777;flex:none;border-bottom:1px solid #e9e9e9}
.term .tt b{color:#222;border-bottom:1.5px solid #0a65c2;padding-bottom:5px;font-weight:600}
.term .tc{flex:1;padding:9px 12px;font-family:"JetBrains Mono";font-size:10.8px;line-height:1.6;color:#2b2b2b;overflow:hidden}
.term .tc .g{color:#8a8a8a}.term .tc .p{color:#7a4fbd}.term .tc .ok{color:#1f7a3f}.term .tc .u{color:#111;font-weight:500}
.cbox{border:1px solid #d9d2e8;border-radius:7px;padding:7px 10px;margin-bottom:7px;background:#fbfaff;display:inline-block;min-width:330px}
.pbox{border:1px solid #d5d5d5;border-radius:7px;padding:6px 10px;color:#9a9a9a;background:#fcfcfc}
.sbar{height:21px;background:#0a65c2;flex:none;display:flex;align-items:center;padding:0 11px;gap:13px;color:#fff;font-size:10px;font-family:"JetBrains Mono"}
/* annotations */
.gut{position:absolute;left:882px;top:40px;width:284px;display:flex;flex-direction:column;gap:13px}
.ann{font-family:"DM Sans";font-size:12.5px;line-height:1.45;color:#1b1a17;background:#fff;border:1px solid #cfcabe;border-radius:9px;padding:9px 11px 9px 36px;box-shadow:0 2px 10px rgba(0,0,0,.06);position:relative}
.ann b{font-weight:600}
.ann .num,.pin{width:20px;height:20px;border-radius:50%;background:#1b1a17;color:#fff;font-family:"JetBrains Mono";font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;flex:none}
.ann .num{position:absolute;left:9px;top:9px}
.pin{position:absolute;box-shadow:0 0 0 2.5px rgba(250,248,244,.95), 0 1px 4px rgba(0,0,0,.3);z-index:5}
"""

def rows(items):
    out=[]
    for it in items:
        ind = it.get('i',0)
        ch = '▾' if it.get('open') else ('▸' if it.get('kind')=='fold' else '')
        ic = it.get('kind','md')
        sel = ' sel' if it.get('sel') else ''
        out.append(f'<div class="row{sel}" style="padding-left:{12+ind*13}px"><span class="ch">{ch}</span><span class="ic {ic}"></span>{html.escape(it["n"])}</div>')
    return '\n'.join(out)

def code(tab, lines):
    ls = '\n'.join(f'<div data-n="{i+1}" class="{c}">{html.escape(t) if t else "&nbsp;"}</div>' for i,(c,t) in enumerate(lines))
    return f'<div class="ed"><div class="tabs"><div class="tab"><span class="ic {tab[1]}"></span>{tab[0]}</div></div><div class="code">{ls}</div></div>'

def scene(s):
    side = f'<div class="side"><h4>Explorer</h4><div class="fld">{s["folder"]}</div>{rows(s.get("rows",[]))}</div>'
    ed = code(s['tab'], s['code']) if s.get('code') else '<div class="ed"></div>'
    term = ''
    if s.get('term'):
        term = ('<div class="term"><div class="tt"><span>PROBLEMS</span><span>OUTPUT</span>'
                '<span>DEBUG CONSOLE</span><b>TERMINAL</b></div><div class="tc">' + s['term'] + '</div></div>')
    anns=[]; pins=[]
    for i,a in enumerate(s['ann'], 1):
        anns.append(f'<div class="ann"><span class="num">{i}</span>{a["t"]}</div>')
        px,py = a['at']
        pins.append(f'<div class="pin" style="left:{px-10}px;top:{py-10}px">{i}</div>')
    return f'''<div class="stage"><div class="vs">
<div class="tb"><span class="tl"><i></i><i></i><i></i></span><span class="tbt">{s["title"]}</span></div>
<div class="mb"><span>File</span><span>Edit</span><span>Selection</span><span>View</span><span>Go</span><span>Run</span><span>Terminal</span><span>Help</span></div>
<div class="body"><div class="act"><i class="on"></i><i></i><i></i><i></i><i></i></div>{side}{ed}</div>
{term}<div class="sbar"><span>{s["sb"]}</span></div></div>
{''.join(pins)}<div class="gut">{''.join(anns)}</div></div>'''

WELCOME = ('<div class="cbox"><span class="p">✻</span> <span class="u">Welcome to Claude Code</span><br>'
           '<span class="g">&nbsp;&nbsp;/help for help, /status for your setup</span><br>'
           '<span class="g">&nbsp;&nbsp;cwd: ~/Desktop/debrief</span></div>'
           '<div class="pbox">&gt; try "what does this project do?"</div>')

SC = [
("step1", {
 "title":"debrief — Visual Studio Code", "folder":"debrief", "rows":[], "sb":"debrief",
 "term": WELCOME,
 "ann":[
   {"at":[525,17],"t":"<b>The folder you opened.</b> Its name shows in the title bar."},
   {"at":[128,99],"t":"<b>The Explorer.</b> Every file you make will appear here. Empty now, which is correct."},
   {"at":[362,420],"t":"<b>Claude Code is running.</b> Check that cwd is your debrief folder."},
 ]}),
("step2", {
 "title":"debrief — Visual Studio Code", "folder":"debrief", "sb":"debrief",
 "rows":[{"n":".claude","kind":"fold","open":True},
         {"n":"agents","kind":"fold","i":1},{"n":"skills","kind":"fold","i":1},
         {"n":"outputs","kind":"fold"},{"n":"transcript","kind":"fold"}],
 "term": ('<span class="u">&gt; Create four empty folders in this project: transcript, outputs,</span><br>'
          '<span class="u">&nbsp;&nbsp;.claude/skills and .claude/agents.</span><br><br>'
          '<span class="g">I will create these four folders. Allow?</span><br>'
          '<span class="ok">&nbsp;&nbsp;❯ 1. Yes</span><br><br>'
          '<span class="ok">✓</span> Created transcript, outputs, .claude/skills, .claude/agents'),
 "ann":[
   {"at":[147,120],"t":"<b>A name starting with a dot is hidden</b> by Finder and File Explorer. VS Code shows it, which is why you work here."},
   {"at":[160,150],"t":"Skills go in one, workers in the other. <b>Lesson 1 fills skills, Lessons 2 and 3 fill agents.</b>"},
   {"at":[425,500],"t":"<b>Claude asks before it changes anything.</b> Say yes."},
 ]}),
("step3", {
 "title":"module-2.vtt — debrief", "folder":"debrief", "sb":"debrief",
 "rows":[{"n":".claude","kind":"fold"},{"n":"outputs","kind":"fold"},
         {"n":"transcript","kind":"fold","open":True},
         {"n":"module-2.vtt","kind":"vtt","i":1,"sel":True}],
 "tab":["module-2.vtt","vtt"],
 "code":[("dim","WEBVTT"),("",""),("dim","1"),
         ("str","00:00:05.480 --> 00:00:07.280"),
         ("","shobhit gupta: Doing an assignment."),("",""),
         ("dim","2"),("str","00:00:07.770 --> 00:00:14.840"),
         ("","shobhit gupta: for the production-ready,"),
         ("","let's say, product, what I experienced is"),("",""),
         ("dim","3"),("str","00:00:15.090 --> 00:00:31.530"),
         ("","shobhit gupta: one, let's say, AI backend,")],
 "ann":[
   {"at":[192,180],"t":"<b>Drag the file in here,</b> then rename it to match the session number."},
   {"at":[519,159],"t":"<b>Each block is one thing someone said,</b> with the time it started."},
   {"at":[600,338],"t":"About 3,800 of these blocks in a two-hour class. <b>That size is why this course has three lessons.</b>"},
 ]}),
("step4", {
 "title":"CLAUDE.md — debrief", "folder":"debrief", "sb":"debrief",
 "rows":[{"n":".claude","kind":"fold"},{"n":"outputs","kind":"fold"},{"n":"transcript","kind":"fold"},
         {"n":"CLAUDE.md","kind":"md","sel":True}],
 "tab":["CLAUDE.md","md"],
 "code":[("h1","# Debrief"),("",""),
         ("","Turns a class transcript into the five"),
         ("","documents a course facilitator ships."),("",""),
         ("h2","## Layout"),("dim","transcript/module-N.vtt   input"),
         ("dim","outputs/module-NN/        five docs"),("",""),
         ("h2","## Reading a transcript"),
         ("","- Cite the start time of a cue."),
         ("","- A topic is something taught for"),
         ("","  over a minute."),("",""),
         ("h2","## This course"),
         ("","- Course: Claude Code in Practice")],
 "ann":[
   {"at":[172,180],"t":"<b>At the top level,</b> not inside a folder. Named in capitals, exactly CLAUDE.md."},
   {"at":[478,266],"t":"<b>The house rules.</b> Every skill and worker you build leans on these instead of repeating them."},
   {"at":[418,355],"t":"<b>The only part you change</b> to reuse this for your own course."},
 ]}),
("step5", {
 "title":"debrief — Visual Studio Code", "folder":"debrief", "sb":"debrief",
 "rows":[{"n":".claude","kind":"fold"},{"n":"outputs","kind":"fold"},{"n":"transcript","kind":"fold"},
         {"n":"CLAUDE.md","kind":"md"}],
 "term": ('<span class="u">&gt; what does this project do?</span><br><br>'
          'It turns a class transcript into the five documents a<br>'
          'facilitator ships after each session: a recap email, a<br>'
          'session report, an FAQ, a quiz and flashcards.<br><br>'
          '<span class="g">Three commands do it, one per mechanism. None of them</span><br>'
          '<span class="g">exist yet.</span>'),
 "ann":[
   {"at":[211,396],"t":"<b>Ask in plain English.</b> No command needed for this."},
   {"at":[385,430],"t":"<b>If the answer describes Debrief,</b> Claude is reading your CLAUDE.md and the setup is right."},
 ]}),
]

doc = ('<!doctype html><html><head><meta charset="utf-8">'
 '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">'
 f'<style>{CSS}</style></head><body>' + ''.join(f'<div id="{n}">{scene(s)}</div>' for n,s in SC) + '</body></html>')
open('steps.html','w').write(doc)
print('scenes:', [n for n,_ in SC])
