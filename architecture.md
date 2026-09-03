# System Architecture & Integration Topology

This document outlines the technical architecture, directory structure, metadata schemas, and component orchestration for the ecosystem.

---

## 1. System Topology & Data Flow

The architecture operates as a configuration-driven local database. Interactivity and automation are handled via four primary layers:
[ User Interaction ]
│
▼
[ Orchestration Layer ]  ──> Templater JS Scripts / MetaBind Triggers
│
▼
[ Data Layer ]           ──> Standardized YAML Frontmatter (.md files)
│
▼
[ Views & Engines ]      ──> TaskNotes Engine / Dataview Queries


### Component Roles
* **Obsidian:** Core file engine and interface runtime.
* **Templater:** Execution engine for object handling; intake prompts, ID generation, file placement, and general parameter compliance.
* **TaskNotes:** Native UI and state management for Action-quadrant objects.
* **Dataview:** Query execution engine for building dynamic relational cards across notes.
* **MetaBind:** Event trigger layer for mounting Templater scripts to UI buttons.

---

## 2. Directory Structure & Quadrants

The vault is 'partitioned' into four 'root' **Quadrants**, serving as top-level data buckets:

```
├── Actions/        <-- Execution objects (Tasks, Projects, Maintenance)
├── Nodes/          <-- Ecosystem entities (Locations, Family Members, Businesses, Institutions)
├── Inventory/      <-- Physical assets (Tools, Equipment, Supplies)
└── Information/    <-- Records (Manuals, CAD, Medical, Specs)
```



### Sample Directory Model
```
root/
├── 🗂️ Workflow Directory/                 <-- Primary UI Layer (Front-of-House)
│   ├──  Dashboard.md                      <-- Main Household/Operator Interface
│   ├── System Config.md                   <-- System Admin & Diagnostic Control
│   ├── Calendar.base                      <-- Tasknotes Schedule & Event Views
│   ├── Kanban.base                        <-- Tasknotes Pipeline & Board Views
│   ├── Agenda.base                        <-- Tasknotes Daily Focus View
|   └── etc., TaskNotes.base Views         <-- Tasknotes Standard .base views all the way down                 
│
├── Actions/                               <-- Dynamic & Static Execution Lake (also TaskNotes folder)
│   └── AUTO_Scripts/                      <-- Templater JS, Meta Bind, Automations
|   └── Archive/                           <-- Tasknotes AutoArchive folder
|                           
├── Information/                           <-- Dynamic & Static Knowledge Lake
│   └── DOC_Templates/                     <-- Native Templates & Object Specs
│
├── Inventory/                             <-- Physical Assets & Resale Lake
│
├── Nodes/                                 <-- Internal Users & External Entities Lake
│
├── .obsidian/                             <-- Hidden Vault Settings
└── .trash/                                <-- Hidden Recycled Data
```

## 3. Classification & Prefix Matrix
Quadrant objects are further characterized into **Octants** by state_type (static/dynamic), which defines the entropic spectrum used to determine the impact of variable dependencies. 
In other words, the state_type describes how likely an object is to be impacted by external forces or variables, how much influence internal structures have on the object's stability;
It's basically a measure of the likelihood of change amongst the various top codes relative to the quadrant root.

Every object created in the system receives a top_code and a prefix that dictate its lifecycle type (Static vs. Dynamic) and folder assignment.

| **Quardrant** | **Prefix** | **Sample Top-Codes** | **State-Type** (defined by Top-Code) | **Pimary Use** |
| --- | --- | --- | --- | --- | 
| **Actions** | ACT | ROU, CHR, MNT, AUD, EVT, AUTO | *Static* | Routines, chores, scheduled/preventative maintenance, automated/delegated; cyclical/recurring in nature |
| **Actions** | ACT | PRJ, REP, UPG, TSK, RES | *Dynamic* | Unplanned repairs, projects, research, one off tasks; sporatic in nature |
| **Nodes** | NOD | USR, LOC | *Static* | Internal family members, locations within your personal ecosystem; home, rooms within the home, workspace; Internal in Nature |
| **Nodes** | NOD | EDU, FIN, LEG, MED, GOV, INS, RET, SVC, IND, SOC | *Dynamic* | External entities, businesses, institutions, service providers, social groups, individuals; External in nature |
| **Inventory** | INV | EQP, FRN, TOL, PROP, SAL | *Static* | Equipment, tools, property that you own; Asset in nature |
| **Inventory** | INV | PRT, SPLY, GROC | *Dynamic* | Wearable parts, supplies, groceries; Consumable in nature |
| **Information** | INFO | PUB, MEDIA, MAN, DOC, WEB, RCP, VIS, CAD, SOFT | *Static* | Published works like books or studies, web pages, recipes, diagrams, user manuals, software; External in nature |
| **Information** | INFO | MED, FIN, EDU, OCC, INS, LEG, IDN, HSG | *Dynamic* | Personal medical, education, financial, occupation, insurance, legal documents and records; Internal in Nature |

## 4. Metadata Schema & Parameter Specifications
---
file_name: <TOP_CODE>_<cleanTitle>_<YYYYMMDD>
id: <PREFIX>-<TOP_CODE>-<cleanTitle>-<YYYYMMDD-HHmmss>
quadrant: <Actions Information Inventory Nodes |>
top_code: <3-4 Letter Identifier>
state_type: <Static Dynamic |>
title: "<Clean Human Title>"

aliases:
 - "${cleanTitle.toLowerCase()}"
 - "@${cleanTitle.toLowerCase()}"
 - "@${cleanTitle}"

# Relational Contexts
```
location: "[[wikilinks to node]"
entity_primary: "[[wikilinks to object2 ]]"
entity_secondary: "[[wikilinks to object3]]"
contexts:
  - "[[INV_doc.pdf]]"
  - "[[INV_EQP.md]]"
  - etc.

status: <Active Archived Completed Unavailable |>
date_created: YYYY-MM-DD
```
---

## Parameter Rules & Types
id (String, Immutable): Deterministic, unique system key combining prefix, top-code, sanitized title, and timestamp.

contexts (List of Wikilinks): Array of double-quoted Wikilinks ("[[Node_Name]]") referencing related entities. Serves as the primary query key for Dataview aggregation.

aliases (List of Strings): Auto-generated lowercase and handle-prefixed strings used for search indexing and fallback mention matching

# 5. Non-Markdown Asset Handling
Raw binary assets (PDFs, CAD .dwg files, images, spreadsheets) cannot store native YAML parameters.

Standard:
1. Raw binaries are stored in asset directories.
2. A Metadata Wrapper Note (.md) is created inside the corresponding Quadrant (typically Information).
3. The wrapper note contains the standard YAML frontmatter and references the binary using:
4. Inline Embed (![[asset.pdf]]): For viewable documents (PDFs, images).
5. Text Link ([[asset.dwg]]): For execution files (CAD, software installers).

# 6. Query Specifications (Dataview Engine)
Dynamic task and relational views embed directly into wrapper files using Dataview TABLE syntax targeting file-level frontmatter properties
```
TABLE status AS Status, date_created AS Created
WHERE quadrant = "Actions"
WHERE contains(contexts, this.file.link) OR any(contains(contexts, this.file.aliases))
WHERE status != "Completed" AND status != "Archived"
SORT date_created DESC
```
