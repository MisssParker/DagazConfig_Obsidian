/**
 * SCRIPT: create-ecosystem-object.js
 * ARCHITECTURE LAYER: System Orchestration / Data Intake
 * 
 * PURPOSE:
 * Interactive Templater modal prompt that creates or opens categorized system notes 
 * across four core Quadrants (Actions, Nodes, Inventory, Information). Generates 
 * standardized YAML frontmatter, unique IDs, aliases, and embedded Dataview queries.
 * 
 * DEPENDENCIES:
 * - Obsidian Plugins: Templater, TaskNotes, Dataview, MetaBind (optional trigger)
 * - Config tasknotes to identify tasks via property > quadrant > "Actions"
 * 
 * WORKFLOW:
 * 1. Prompts for Quadrant (Actions, Nodes, Inventory, Information).
 * 2. Prompts for Top-Code classification based on selected Quadrant.
 * 3. Prompts for Title, constructs clean ID/Aliases, and builds YAML frontmatter.
 * 4. Injects embedded Dataview TABLE queries matching TaskNotes contexts/aliases.
 * 5. Checks if file already exists in vault: opens existing note OR creates new file.
 */




<%*
// 1. First Popup: Select Root Quadrant
const quadrant = await tp.system.suggester(
  ["⚡ Action (Task, Routine, Project)", "👥 Node (Person, Place, Provider)", "📦 Inventory (Asset, Tool, Equipment)", "📑 Information (Document, Manual, Record)"],
  ["Actions", "Nodes", "Inventory", "Information"]
);

if (!quadrant) return;

let topCode = "";
let stateType = "";
let prefix = "";

// 2. Second Popup: Filter Top Codes based on chosen Quadrant
if (quadrant === "Nodes") {
  topCode = await tp.system.suggester(
	[ 
	"📍 LOC - Location Within Ecosystem",
	"😎 USR - System User / Household Member",
	"🏫 EDU - Educational Institution",
	"💳 FIN - Financial Institution",
	"🏛️ GOV - Government Institution",
	"👩‍⚕️ MED - Medical Provider and Services",
	"⚖ LEG - Legal Services / Lawyers and Law Offices",
	"🛡️ INS - Insurance Providers",
	"🚰 UTL - Utility Providers",
	"👨‍🔧 SVC - Services and Contractors",
	"🛍 RET - Retailers and Stores",
	"🤝 SOC - Social Groups / Charities, Religious Org, and Clubs",
	"👤 IND - Individuals" 
	],
    ["LOC", "USR", "EDU", "FIN", "GOV", "MED", "LEG", "INS", "UTL", "SVC", "RET", "SOC", "IND"],
  );
  stateType = ["LOC", "USR"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "NODE";
} 
else if (quadrant === "Actions") {
  topCode = await tp.system.suggester(
	[
	"✅ TSK - Task / Single Action",
	"🎯 PRJ - Project / Multi-step Endeavor",
	"🛠️ REP - Unplanned Repairs / Troubleshooting",
	"💪 UPG - System Upgrades",
	"🔍 RES - Research / Deep Dive",
	"🔄 ROU - Daily, Individual Routines",
	"🗑 CHR - Household Chores",
	"⚙ MNT - Planned Preventative Maintenance",
	"📊 AUD - Routine System Audits",
	"📅 EVT - Event / Appointment / Meeting",
	"🤖 AUTO - Automated Actions / Scripts / Delegated"
	],
    ["TSK", "PRJ", "REP", "UPG", "RES", "ROU", "CHR", "MNT", "AUD", "EVT", "AUTO"]
  );
  stateType = ["ROU", "CHR", "MNT", "AUD", "EVT", "AUTO"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "ACT";
}
else if (quadrant === "Inventory") {
  topCode = await tp.system.suggester(
    [
    "🔌 EQP - Equipment / Appliance",
    "🔧 TOL - Tool",
    "🛋️ FRN - Furniture / Fixture",
    "🏷️ SAL - Item for Resale / Liquidation",
    "🚧 PRT - Wearable Part",
    "🔋 SPLY - Household Supply",
    "🛒GROC - Groceries / Consumables"
    ],
    ["EQP", "TOL", "FRN", "SAL", "PRT", "SPLY", "GROC"],
  );
  stateType = ["EQP", "TOL", "FRN", "SAL"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "INV";
}
else if (quadrant === "Information") {
  topCode = await tp.system.suggester(
    [
    "📔 PUB - Published Works",
    "💿 MEDIA - Videos",
    "👀 VIS- Static Visual",
    "📐 CAD - Models and Patterns",
    "📖 DOC - Document",
    "📑 MAN - Manual",
    "💻 WEB - Website / Webpage",
    "📀 SOFT - Software",
    "🍽 RCP - Recipes",
    "🏥 MED - Health Record",
    "🏫 EDU - School / Academic Record",
    "💳 FIN - Financial Document",
    "🛡 INS- Insurance",
    "⚖ LEG- Legal",
    "📜 IDN - Identity",
    "💼 OCC - Occupation",
    ],
    ["PUB", "MEDIA", "VIS", "CAD", "DOC", "MAN", "WEB", "SOFT", "RCP", "MED", "EDU", "FIN", "INS", "LEG", "IDN", "OCC"]
  );
  stateType = ["PUB", "MEDIA", "VIS", "CAD", "DOC", "MAN", "WEB", "SOFT", "RCP"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "INFO";
}

if (!topCode) return;

// 3. Third Popup: Ask for the Name / Title
const titleInput = await tp.system.prompt(`Enter title/name for this ${topCode}:`);
if (!titleInput) return;

// Generate UUID & Clean Names
const dateCreated = tp.date.now("YYYY-MM-DD");
const timeStamp = tp.date.now("YYYYMMDD-HHmmss");
const cleanTitle = titleInput .trim() .split(" ") .map(w => w.charAt(0).toUpperCase() + w.slice(1)) .join(" ");
const objId = `${prefix}-${topCode}-${cleanTitle}-${timeStamp}`;
const fileName = `${topCode}_${cleanTitle}`


// Construct YAML Properties dynamically
const yaml = `---
id: ${objId}
quadrant: ${quadrant}
state_type: ${stateType}
top_code: ${topCode}
title: "${cleanTitle}"
aliases:
 - "${cleanTitle.toLowerCase()}"
 - "@${cleanTitle.toLowerCase()}"
 - "@${cleanTitle}"
status: Active
date_created: ${tp.date.now("YYYY-MM-DD")}
---
`;


// Base Body Layout (Standard across all files)
let body = `# ${cleanTitle}\n\n`;
// ⚡ Active Tasks Card
body += `### ⚡ Active Tasks\n\`\`\`dataview\nTABLE status AS Status, date_created AS Created\nWHERE quadrant = "Actions"\nWHERE any(contains(contexts, this.file.aliases))\nWHERE status != "Completed" AND status != "Archived" AND status != "Unavailable"\nSORT date_created DESC\n\`\`\`\n\n`;

// 📜 Completed & Archived Tasks Callout/Card
body += `> [!NOTE]- 📜 Completed & Archived Activity History\n> \`\`\`dataview\n> TABLE status AS Status, date_created AS Created\n> WHERE quadrant = "Actions"\n> WHERE any(contains(contexts, this.file.aliases))\n> WHERE status = "Completed" OR status = "Archived"\n> SORT date_created DESC\n> \`\`\`\n\n---\n\n`;
// Additional Top-Code Specific Cards

// 4. Check for Existing File & Handle Creation / Opening
const targetFolderPath = quadrant;
const fullFilePath = `${targetFolderPath}/${fileName}.md`;

// Check if a file with this exact path already exists in your vault
const existingFile = app.vault.getAbstractFileByPath(fullFilePath);

if (existingFile) {
  // If it exists, open the existing note instead of making a duplicate
  await app.workspace.getLeaf().openFile(existingFile);
} else {
  // If it doesn't exist, get folder reference and create the new note
  const targetFolder = app.vault.getAbstractFileByPath(targetFolderPath);
  
  if (targetFolder) {
    const newFile = await tp.file.create_new(yaml + body, fileName, false, targetFolder);
    await app.workspace.getLeaf().openFile(newFile);
  } else {
    const newFile = await tp.file.create_new(yaml + body, fileName, false);
    await app.workspace.getLeaf().openFile(newFile);
  }
}

-%>
