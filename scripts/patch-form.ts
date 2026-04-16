import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'src/components/admin/EntityRegistryClient.tsx')
let content = fs.readFileSync(filePath, 'utf8')

// Replace conditional renders with hidden divs
for (let i = 0; i <= 6; i++) {
  // Replace the opening
  const searchRegex = new RegExp(`\\{step === ${i} && \\(\\s*<div([^>]+)>`, 'g')
  content = content.replace(searchRegex, `<div className={step === ${i} ? 'block' : 'hidden'}><div$1>`)
}

// Ensure formNoValidate is on the final submit button to prevent Chrome validation blocking
content = content.replace(
  '<button type="submit" disabled={submitting || checkingDup}',
  '<button type="submit" formNoValidate disabled={submitting || checkingDup}'
)

// Now we need to manually fix the closing braces } for those conditionals
// Looking at the code structure:
content = content.replace(/ \n            \)\}\n\n            \{\/\* ── SECTION/g, '\n            </div>\n\n            {/* ── SECTION')

// Fix the last section (Section 6 closing brace)
content = content.replace(/ \n            \)\}\n          <\/div>\n\n          \{\/\* Footer/g, '\n            </div>\n          </div>\n\n          {/* Footer')

fs.writeFileSync(filePath, content, 'utf8')
console.log('Form patched successfully')
