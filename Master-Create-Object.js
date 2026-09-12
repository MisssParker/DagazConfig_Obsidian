/**
 * SCRIPT: Master-Create-Object.js
 * ARCHITECTURE LAYER: System Orchestration / Data Intake
 * 
* PURPOSE:
 * Interactive Templater intake prompt that creates or opens categorized system notes 
 * across four core Quadrants (Actions, Nodes, Inventory, Information). Enforces schema 
 * integrity by generating standardized YAML properties, UUIDs, aliases, node linkages, 
 * attachment embeddings, and embedded Dataview queries.
 * 
 * DEPENDENCIES:
 * - Obsidian Plugins: Templater, TaskNotes, Dataview, MetaBind
 * 
 * WORKFLOW:
 * 1. Prompts for Root Quadrant (Actions, Nodes, Inventory, Information).
 * 2. Prompts for Top-Code taxonomy based on chosen Quadrant.
 * 3. Prompts for Title, constructs clean ID/Aliases, and builds base YAML.
 * 4. Interrogates vault cache for target top_codes to prompt Objective/Subjective node links.
 * 5. Queries vault files to display non-markdown attachment selector (Information Quadrant).
 * 6. Builds conditional frontmatter, MetaBind action controls, and Dataview tables.
 * 7. Checks for path collisions: opens existing note OR creates new file in folder.
 */




<%*
await (async () => {

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
    ["LOC", "USR", "EDU", "FIN", "GOV", "MED", "LEG", "INS", "UTL", "SVC", "RET", "SOC", "IND"]
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
      "🛒 GROC - Groceries / Consumables"
    ],
    ["EQP", "TOL", "FRN", "SAL", "PRT", "SPLY", "GROC"]
  );
  stateType = ["EQP", "TOL", "FRN", "SAL"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "INV";
} 
else if (quadrant === "Information") {
  topCode = await tp.system.suggester(
    [
      "📔 PUB - Published Works",
      "💿 MEDIA - Videos",
      "👀 VIS - Static Visual",
      "📐 CAD - Models and Patterns",
      "📖 DOC - Document",
      "📑 MAN - Manual",
      "💻 WEB - Website / Webpage",
      "📀 SOFT - Software",
      "🍽 RCP - Recipes",
      "🏥 MED - Health Record",
      "🏫 EDU - School / Academic Record",
      "💳 FIN - Financial Document",
      "🛡 INS - Insurance",
      "⚖ LEG - Legal",
      "📜 IDN - Identity",
      "💼 OCC - Occupation"
    ],
    ["PUB", "MEDIA", "VIS", "CAD", "DOC", "MAN", "WEB", "SOFT", "RCP", "MED", "EDU", "FIN", "INS", "LEG", "IDN", "OCC"]
  );
  stateType = ["PUB", "MEDIA", "VIS", "CAD", "DOC", "MAN", "WEB", "SOFT", "RCP"].includes(topCode) ? "Static" : "Dynamic";
  prefix = "INFO";
}

if (!topCode) return;

// 3. Third Popup: Ask for Title
const titleInput = await tp.system.prompt(`Enter title/name for this ${topCode}:`);
if (!titleInput) return;

// Helper: Safely fetch matching note basenames as pure String arrays
function fetchVaultNotesByCodes(targetCodes) {
  const files = app.vault.getMarkdownFiles();
  const matchedNames = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cache = app.metadataCache.getFileCache(file);
    if (cache && cache.frontmatter && targetCodes.includes(cache.frontmatter.top_code)) {
      matchedNames.push(String(file.basename));
    }
  }
  return matchedNames;
}

let objNodeSelection = "";
let subjNodeSelection = "";
let attachmentInput = "";

// 4. Handle Relationship Prompts for Nodes and Information Quadrants
if (quadrant === "Nodes" || quadrant === "Information") {
  
  // Prompt Objective Nodes (USR, LOC)
  const objValues = ["", ...objNotes.map(name => `[[${name}]]`)];
  
  const objLabels = ["❌ [ Skip / None ]", ...objNotes];
  const objValues = ["", ...objNotes.map(name => `[[${name}]]`)];
  
  const chosenObj = await tp.system.suggester(objLabels, objValues);
  objNodeSelection = chosenObj || "";

  // Prompt Subjective Nodes (EDU, FIN, GOV, MED, LEG, INS, UTL, SVC, RET, SOC, IND)
  const subjCodes = ["EDU", "FIN", "GOV", "MED", "LEG", "INS", "UTL", "SVC", "RET", "SOC", "IND"];
  const subjNotes = fetchVaultNotesByCodes(subjCodes);

  const subjLabels = ["❌ [ Skip / None ]", ...subjNotes];
  const subjValues = ["", ...subjNotes.map(name => `[[${name}]]`)];

  const chosenSubj = await tp.system.suggester(subjLabels, subjValues);
  subjNodeSelection = chosenSubj || "";

  // Prompt File Attachment Embedding (Information Quadrant Only)
  if (quadrant === "Information") {
    attachmentInput = await tp.system.prompt("Attachment file name to embed (e.g., Document.pdf or image.png):", "");
  }
}

// Generate UUID & Clean Names
const dateCreated = tp.date.now("YYYY-MM-DD");
const timeStamp = tp.date.now("YYYYMMDD-HHmmss");
const cleanTitle = titleInput.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const objId = `${prefix}-${topCode}-${cleanTitle}-${timeStamp}`;
const fileName = `${topCode}_${cleanTitle}`;

// Construct YAML Properties dynamically
let yaml = `---
id: "${objId}"
quadrant: "${quadrant}"
state_type: "${stateType}"
top_code: "${topCode}"
title: "${cleanTitle}"
aliases:
  - "${cleanTitle.toLowerCase()}"
  - "@${cleanTitle.toLowerCase()}"
  - "@${cleanTitle}"
status: Active
date_created: ${dateCreated}
`;

if (objNodeSelection) yaml += `objective_node: "${objNodeSelection}"\n`;
if (subjNodeSelection) yaml += `subjective_node: "${subjNodeSelection}"\n`;
if (attachmentInput) yaml += `attachment: "![[${attachmentInput}]]"\n`;
yaml += `---\n\n`;

// Base Body Layout
let body = `# ${cleanTitle}\n\n`;

// Quick Action Card with Metabind
body += `## ✨ Action Hub\n> [!abstract]+ Workspace Controls\n> \`BUTTON[button_CreateNewObject]\` \`BUTTON[button_RefreshView]\` \n\n---\n\n`;

// Active Tasks Card
body += `### ⚡ Active Tasks\n\`\`\`dataview\nTABLE status AS Status, date_created AS Created\nWHERE quadrant = "Actions"\nWHERE any(contains(contexts, this.file.aliases))\nWHERE status != "Completed" AND status != "Archived" AND status != "Unavailable"\nSORT date_created DESC\n\`\`\`\n\n`;

// Completed & Archived Tasks
body += `> [!NOTE]- 📜 Completed & Archived Activity History\n> \`\`\`dataview\n> TABLE status AS Status, date_created AS Created\n> WHERE quadrant = "Actions"\n> WHERE any(contains(contexts, this.file.aliases))\n> WHERE status = "Completed" OR status = "Archived"\n> SORT date_created DESC\n> \`\`\`\n\n---\n\n`;

// 5. Render Object Cards based on Quadrant
if (quadrant === "Information") {
  body += `> [!info]+ 📑 Information Object Card\n`;
  if (attachmentInput) body += `> **Embedded File:**\n> ![[${attachmentInput}]]\n>\n`;
  body += `> **Objective Node (Subject):** ${objNodeSelection ? objNodeSelection : "*None Selected*"}\n`;
  body += `> **Subjective Node (Context):** ${subjNodeSelection ? subjNodeSelection : "*None Selected*"}\n\n---\n\n`;
}

if (quadrant === "Nodes") {
  body += `> [!user]+ 👥 Objective Node Context\n`;
  body += `> ${objNodeSelection ? objNodeSelection : "*No parent objective nodes linked*"}\n\n`;

  body += `> [!building]+ 🏛️ Subjective Entity Context\n`;
  body += `> ${subjNodeSelection ? subjNodeSelection : "*No parent subjective entities linked*"}\n\n`;

  body += `### 📑 Linked Information Objects\n`;
  body += `\`\`\`dataview\nTABLE top_code AS Type, date_created AS Created\nWHERE quadrant = "Information"\nWHERE contains(objective_node, this.file.name) OR contains(subjective_node, this.file.name)\nSORT date_created DESC\n\`\`\`\n\n---\n\n`;
}

// 6. Handle File Creation
const targetFolderPath = quadrant;
const fullFilePath = `${targetFolderPath}/${fileName}.md`;
const existingFile = app.vault.getAbstractFileByPath(fullFilePath);

if (existingFile) {
  await app.workspace.getLeaf().openFile(existingFile);
} else {
  const targetFolder = app.vault.getAbstractFileByPath(targetFolderPath);
  if (targetFolder) {
    const newFile = await tp.file.create_new(yaml + body, fileName, false, targetFolder);
    await app.workspace.getLeaf().openFile(newFile);
  } else {
    const newFile = await tp.file.create_new(yaml + body, fileName, false);
    await app.workspace.getLeaf().openFile(newFile);
  }
}

})();
-%>
