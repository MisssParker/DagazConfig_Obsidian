# DagazConfig_Obsidian
Configuration settings for Dagaz framework to Obsidian Vault

Hey, uh, maybe don't use this rn. I just need somewhere to document my manic episodes, so, if you do use it, it's at your own risk.

## Purpose
This describes the integration topology applied according to Dagaz framework within the infrastructure it's being applied to. Dagaz describes the philosophy behind the logic, and the integration topology is the enforcement method adopted based on those principles established. For more about the philosophy, see philosophy.md file. For more about the overall architecture, see architecture.md.

## Execution
This is built on top of free and open-source software that others have already created, so the scripts and configs act as a bridge or connective tissue, encouraging the desired behavior from those amazing tools as they collaborate under a unified architecture. Pick and choose applicable files at your leisure. See architecture.md for how they impact one another. 

### Dependencies 
- Obsidian
  - Templater community plugin
  - Metabind community plugin
  - TaskNotes community plugin
    
## 🛠 Orchestration Scripts

### `Master-Create-Object.js`
* **Type:** Templater User Script / MetaBind Action
* **Role:** Primary intake engine for generating architecture-compliant notes across all four quadrants.
* **Key Features:**
  * Auto-assigns unique IDs (`ACT-TSK-Title-Timestamp`).
  * Generates lowercased and handle-prefixed aliases (`title`, `@title`).
  * Automatically injects file-level Dataview queries linked to TaskNotes `contexts`.
  * Automatically embeds dataview cards for active and completed/archived tasks relative to the created object (via quadrant property and contexts property
  * Safe file checker: Prevents duplicate creation by opening the note if it already exists.
