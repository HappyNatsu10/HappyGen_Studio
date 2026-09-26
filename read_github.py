import json
d = json.load(open('github_issues.json', encoding='utf-8'))
for item in d.get('items', [])[:5]:
    print(item['title'], '-', item['html_url'])
