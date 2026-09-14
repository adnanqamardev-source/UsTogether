const fs = require('fs');
const globalConfigPath = 'C:\\Users\\adnan\\.config\\opencode\\opencode.json';
const localConfigPath = 'D:\\AGENTIC ENGINEERING\\UsTogether\\opencode.json';

const globalConfigStr = fs.readFileSync(globalConfigPath, 'utf8');
let globalConfig = JSON.parse(globalConfigStr);

const localConfigStr = fs.readFileSync(localConfigPath, 'utf8');
const localConfig = JSON.parse(localConfigStr);

if (!globalConfig.mcp) {
  globalConfig.mcp = {};
}

// Merge MCP from local to global
Object.assign(globalConfig.mcp, localConfig.mcp);

fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2), 'utf8');
console.log('Global configuration updated successfully.');
