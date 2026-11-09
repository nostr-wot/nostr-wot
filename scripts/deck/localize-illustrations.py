from pathlib import Path
import xml.etree.ElementTree as ET
import re
base = Path(__file__).resolve().parents[2]
ET.register_namespace('', 'http://www.w3.org/2000/svg')
locales=['es','en','pt','fr','it','de','ru']
rows={}
for line in (base/'scripts/deck/illustration-labels.txt').read_text().splitlines():
    cells=line.split('|')
    assert len(cells)==8, cells
    rows[cells[0]]=dict(zip(locales,cells[1:]))
for locale in locales:
    target=base/'public/deck/assets'/locale
    target.mkdir(exist_ok=True)
    for source in (base/'public/deck/assets').glob('*.svg'):
        tree=ET.parse(source)
        for el in tree.iter():
            if el.tag.split('}')[-1] not in ('text','tspan') or not el.text: continue
            original=el.text
            if original in rows:
                el.text=rows[original][locale]
                size=el.get('font-size')
                if size and re.fullmatch(r'[\d.]+',size) and len(el.text)>len(original)*1.15:
                    el.set('font-size',str(round(float(size)*max(.72,len(original)*1.1/len(el.text)),2)))
            # Original tutorial artwork has dark labels designed for a light website.
            if el.get('fill') in ['#111827','#374151','#4b5563','#000','#000000']:
                el.set('fill','#cbd5e1')
        tree.write(target/source.name,encoding='unicode')
