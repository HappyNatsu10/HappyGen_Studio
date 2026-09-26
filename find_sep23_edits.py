import json
import sys

transcript_path = r'C:\Users\Administrator\.gemini\antigravity-ide\brain\41baccee-871c-4757-9bd7-9e04710c96ea\.system_generated\logs\transcript.jsonl'

changes = []

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            entry = json.loads(line)
        except:
            continue
            
        if '2026-09-23' in entry.get('created_at', ''):
            if entry.get('type') == 'PLANNER_RESPONSE':
                for tool in entry.get('tool_calls', []):
                    name = tool.get('name')
                    if name in ('replace_file_content', 'multi_replace_file_content', 'write_to_file'):
                        args = tool.get('args', {})
                        target = args.get('TargetFile')
                        
                        if target:
                            changes.append({
                                'time': entry['created_at'],
                                'file': target.split('\\')[-1],
                                'action': args.get('toolAction') or args.get('Instruction'),
                                'content': args.get('ReplacementContent') or args.get('CodeContent') or args.get('ReplacementChunks')
                            })

for c in changes:
    print(f"[{c['time']}] {c['file']}")
    print(f"Action: {c['action']}")
    if isinstance(c['content'], str):
        safe_str = c['content'][:300].replace('\n', ' ').encode('ascii', 'ignore').decode('ascii')
        print(f"Content snippet: {safe_str}")
    elif isinstance(c['content'], list):
        print("Chunks:", len(c['content']))
    print("-" * 50)
