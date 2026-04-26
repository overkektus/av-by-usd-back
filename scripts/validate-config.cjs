const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../remote-config.json');

try {
  if (!fs.existsSync(configPath)) {
    console.error('❌ Error: remote-config.json not found in root directory');
    process.exit(1);
  }

  const content = fs.readFileSync(configPath, 'utf8');
  if (!content.trim()) {
    console.log('✅ remote-config.json is empty, but valid (will use local defaults)');
    process.exit(0);
  }

  const data = JSON.parse(content);

  if (!data.selectors || !Array.isArray(data.selectors)) {
    console.error('❌ Error: remote-config.json must have a "selectors" array');
    process.exit(1);
  }

  for (const s of data.selectors) {
    if (typeof s.selector !== 'string') {
      console.error(`❌ Error: Invalid selector entry: ${JSON.stringify(s)}. "selector" property is required and must be a string.`);
      process.exit(1);
    }
  }

  console.log('✅ remote-config.json is valid and ready to be pushed!');
} catch (e) {
  console.error(`❌ Error: Failed to parse remote-config.json: ${e.message}`);
  process.exit(1);
}
