from pathlib import Path
path = Path(r"C:\Program Files\PostgreSQL\17\data\pg_hba.conf")
text = path.read_text(encoding='utf-8')
for i, line in enumerate(text.splitlines(), 1):
    if 'scram-sha-256' in line:
        print(i, repr(line))
