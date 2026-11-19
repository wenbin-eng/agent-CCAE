"""更新预览 HTML 内嵌模块；业务源文件为唯一修改入口。"""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1] / 'preview'
page = root / 'index.page.html'
text = page.read_text()
start = text.index('const sources=') + len('const sources=')
end = text.index(';\nconst cache', start)
sources = {
    './' + path.relative_to(root).as_posix(): path.read_text()
    for path in root.rglob('*')
    if path.is_file() and path.suffix in ('.jsx', '.js') and 'library' not in path.parts
}
page.write_text(text[:start] + json.dumps(sources).replace('</', '<\\/') + text[end:])
print('Preview modules synchronized.')
