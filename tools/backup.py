#!/usr/bin/env python3
"""Snapshot de todas las claves textdb (deseos + giro-*) y comparación con el snapshot anterior.
Uso: python3 tools/backup.py [--dir /home/mano/app_support/amigo-secreto/backups]"""
import json, re, sys, os, unicodedata, urllib.request, datetime, glob, time
BASE = 'https://textdb.dev/api/data/amigo-secreto-9qp0id-'
DIR = sys.argv[sys.argv.index('--dir')+1] if '--dir' in sys.argv else '/home/mano/app_support/amigo-secreto/backups'
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.js'), encoding='utf-8').read()
P = json.loads(re.search(r'"participantes":\s*(\[[^\]]*\])', src).group(1))
def slug(n):
    n = ''.join(c for c in unicodedata.normalize('NFD', n) if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', '-', n)
def get(n):
    for i in range(3):
        try:
            with urllib.request.urlopen(BASE + slug(n) + '?t=%d' % time.time(), timeout=20) as r:
                return r.read().decode('utf-8')
        except Exception as e:
            err = e; time.sleep(1)
    raise err
def text(raw):
    try: l = json.loads(raw) if raw.strip() else []
    except Exception: return raw.strip()
    if not isinstance(l, list): return raw.strip()
    return ' | '.join(((x.get('lista') if 'lista' in x else x.get('descripcion')) or '').strip() + ' ' + ' '.join(x.get('urls') or []) for x in l).strip(' |')
snap = {}
for n in P:
    snap[n] = get(n); snap['giro-' + n] = get('giro-' + n)
os.makedirs(DIR, exist_ok=True)
prev = sorted(glob.glob(os.path.join(DIR, '*.json')))
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
out = os.path.join(DIR, ts + '.json')
json.dump({'taken': ts, 'keys': snap}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('Snapshot:', out)
print('Con deseo:', ', '.join(n for n in P if text(snap[n])) or '-')
if prev:
    old = json.load(open(prev[-1], encoding='utf-8'))['keys']
    lost = [(k, text(v)) for k, v in old.items() if text(v) and (k not in snap or not text(snap[k]))]
    print('Comparado con', prev[-1])
    for k, v in lost: print('  ⚠️  PERDIDO:', k, '->', v[:200])
    if not lost: print('  OK: ningún deseo pasó de lleno a vacío.')
