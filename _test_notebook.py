import json
import shutil
import tempfile
from pathlib import Path

nb = json.loads(Path('dataset_training.ipynb').read_text(encoding='utf-8'))
work = Path(tempfile.mkdtemp(prefix='matchfluence_nbtest_'))
seed = work / 'seed_data'
seed.mkdir(parents=True, exist_ok=True)
for src in Path('output').glob('*.json'):
    shutil.copy2(src, seed / src.name)

ns = {'__name__': '__main__'}
cell3 = ''.join(nb['cells'][3]['source']).replace('BASE_DIR = Path("/content/matchfluence_ml")', f'BASE_DIR = Path({str(work)!r})')
for idx, code in [
    (3, cell3),
    (8, ''.join(nb['cells'][8]['source'])),
    (10, ''.join(nb['cells'][10]['source'])),
    (12, ''.join(nb['cells'][12]['source'])),
    (14, ''.join(nb['cells'][14]['source'])),
    (16, ''.join(nb['cells'][16]['source'])),
    (18, ''.join(nb['cells'][18]['source'])),
    (20, ''.join(nb['cells'][20]['source'])),
    (22, ''.join(nb['cells'][22]['source'])),
    (24, ''.join(nb['cells'][24]['source'])),
]:
    print(f'\n--- executing cell {idx} ---')
    exec(compile(code, f'cell_{idx}', 'exec'), ns)

print('\nNotebook critical path OK')
print('df shape:', ns['df'].shape)
print('labels:', ns['df']['label'].value_counts().to_dict())
print('feature cols:', len(ns['feature_cols']))
shutil.rmtree(work, ignore_errors=True)
