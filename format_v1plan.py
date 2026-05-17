import re

with open('v1plan.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace volumes
content = content.replace("80 influencer", "20 influencer")
content = content.replace("50 işletme", "10 işletme")
content = content.replace("~2400 post", "300-500 post")
content = content.replace("80 işbirliği ilanı", "20 işbirliği ilanı")
content = content.replace("~800 swipe", "100-200 swipe")
content = content.replace("~150 match", "40 match")
content = content.replace("~80 anlaşma", "20 anlaşma")
content = content.replace("5000 çift", "1000 training pair")
content = content.replace("5000 adet", "1000 adet")

# Add checkboxes to headers under section 1, 2, 3
lines = content.split('\n')
new_lines = []
for line in lines:
    if line.startswith('#### 1.') or line.startswith('### 1.') or line.startswith('### 2.') or line.startswith('### 3.'):
        if line.startswith('#### '):
            new_lines.append(line.replace('#### ', '#### - [ ] '))
        elif line.startswith('### '):
            new_lines.append(line.replace('### ', '### - [ ] '))
    else:
        new_lines.append(line)

# Let's specifically mark Emir's AI tasks as checked since we did the rule-based matching!
content = '\n'.join(new_lines)
content = content.replace("### - [ ] 3.1", "### - [x] 3.1")
content = content.replace("### - [ ] 3.2", "### - [x] 3.2")
content = content.replace("### - [ ] 3.3", "### - [x] 3.3")
content = content.replace("### - [ ] 3.4", "### - [x] 3.4")

with open('v1plan.md', 'w', encoding='utf-8') as f:
    f.write(content)

