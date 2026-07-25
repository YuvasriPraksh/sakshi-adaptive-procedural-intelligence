from pathlib import Path

path = Path(r"C:\Program Files\PostgreSQL\17\data\pg_hba.conf")
backup = path.with_name('pg_hba.conf.bak')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
out_lines = []
changed = False
for line in lines:
    stripped = line.strip()
    if 'scram-sha-256' in line and (
        stripped.startswith('local') or 
        (stripped.startswith('host') and ('127.0.0.1/32' in line or '::1/128' in line))
    ):
        out_lines.append(line.replace('scram-sha-256', 'trust'))
        changed = True
    else:
        out_lines.append(line)

if not changed:
    print('No matching lines to change in pg_hba.conf')
else:
    if not backup.exists():
        backup.write_text(text, encoding='utf-8')
        print('Backup created:', backup)
    path.write_text('\n'.join(out_lines) + '\n', encoding='utf-8')
    print('pg_hba.conf updated to trust local connections')
