/**
 * Static character data for RPG mode
 */

export interface CharacterMove {
  id: string;
  name: string;
  description: string;
  damage: number;
  effects: {
    speed: number;
    cost: number;
    security: number;
    trust: number;
    adoption: number;
    scalability: number;
  };
  displayOrder: number;
}

export interface Character {
  id: string;
  name: string;
  spriteName: string;
  focus: string;
  personaVibe: string;
  displayOrder: number;
  moves: CharacterMove[];
}

export interface Adversary {
  id: string;
  name: string;
  spriteName: string;
  scenarioType: string;
  description: string | null;
}

export const CHARACTERS: Character[] = [
  {
    id: "c1",
    name: "License Lawyer",
    spriteName: "lawyer_penguin",
    focus: "Compliance & Legal Strategy",
    personaVibe: "Meticulous and thorough — reads every EULA",
    displayOrder: 1,
    moves: [
      { id: "m1", name: "LICENSE AUDIT", description: "Thorough compliance review", damage: 35, effects: { speed: 0, cost: 0, security: 10, trust: 5, adoption: 0, scalability: 0 }, displayOrder: 1 },
      { id: "m2", name: "LEGAL SHIELD", description: "IP protection defense", damage: 15, effects: { speed: 0, cost: 0, security: 15, trust: 0, adoption: 0, scalability: 0 }, displayOrder: 2 },
      { id: "m3", name: "POLICY BLAST", description: "Formal policy enforcement", damage: 40, effects: { speed: -5, cost: 0, security: 5, trust: 0, adoption: 5, scalability: 0 }, displayOrder: 3 },
      { id: "m4", name: "SBOM STRIKE", description: "Software bill of materials attack", damage: 30, effects: { speed: 0, cost: 5, security: 10, trust: 5, adoption: 0, scalability: 5 }, displayOrder: 4 },
    ],
  },
  {
    id: "c2",
    name: "Community Builder",
    spriteName: "community_penguin",
    focus: "Ecosystem & Community Growth",
    personaVibe: "Energetic connector — knows everyone upstream",
    displayOrder: 2,
    moves: [
      { id: "m5", name: "UPSTREAM PR", description: "Community contribution attack", damage: 30, effects: { speed: 5, cost: 0, security: 0, trust: 10, adoption: 10, scalability: 0 }, displayOrder: 1 },
      { id: "m6", name: "FORK SHIELD", description: "Open-source fork defense", damage: 15, effects: { speed: 0, cost: 5, security: 0, trust: 5, adoption: 5, scalability: 5 }, displayOrder: 2 },
      { id: "m7", name: "COMMUNITY RALLY", description: "Ecosystem mobilization", damage: 45, effects: { speed: 0, cost: 0, security: 0, trust: 15, adoption: 15, scalability: 0 }, displayOrder: 3 },
      { id: "m8", name: "MAINTAINER MODE", description: "Sustained contribution boost", damage: 25, effects: { speed: 5, cost: 0, security: 5, trust: 10, adoption: 5, scalability: 5 }, displayOrder: 4 },
    ],
  },
  {
    id: "c3",
    name: "AI Strategist",
    spriteName: "ai_penguin",
    focus: "AI Governance & Innovation",
    personaVibe: "Forward-thinking — always two steps ahead",
    displayOrder: 3,
    moves: [
      { id: "m9", name: "PROMPT INJECT", description: "AI-powered strategic attack", damage: 40, effects: { speed: 10, cost: 0, security: 0, trust: 0, adoption: 10, scalability: 5 }, displayOrder: 1 },
      { id: "m10", name: "MODEL SHIELD", description: "AI safety defense", damage: 15, effects: { speed: 0, cost: 0, security: 15, trust: 5, adoption: 0, scalability: 0 }, displayOrder: 2 },
      { id: "m11", name: "DATA SOVEREIGN", description: "Data sovereignty enforcement", damage: 35, effects: { speed: -5, cost: 0, security: 15, trust: 10, adoption: 0, scalability: 5 }, displayOrder: 3 },
      { id: "m12", name: "OPEN MODEL", description: "Deploy open-source alternative", damage: 30, effects: { speed: 5, cost: 10, security: 5, trust: 5, adoption: 10, scalability: 10 }, displayOrder: 4 },
    ],
  },
  {
    id: "c4",
    name: "Security Guardian",
    spriteName: "shield_penguin",
    focus: "Supply Chain Security",
    personaVibe: "Vigilant protector — trusts but verifies",
    displayOrder: 4,
    moves: [
      { id: "m13", name: "VULN SCAN", description: "Vulnerability scanning attack", damage: 35, effects: { speed: 0, cost: 0, security: 15, trust: 5, adoption: 0, scalability: 0 }, displayOrder: 1 },
      { id: "m14", name: "PATCH WALL", description: "Defensive patching", damage: 15, effects: { speed: 0, cost: -5, security: 20, trust: 0, adoption: 0, scalability: 0 }, displayOrder: 2 },
      { id: "m15", name: "SIGSTORE SEAL", description: "Signed artifact verification", damage: 40, effects: { speed: -5, cost: 0, security: 20, trust: 10, adoption: 0, scalability: 5 }, displayOrder: 3 },
      { id: "m16", name: "ZERO TRUST", description: "Zero-trust architecture deploy", damage: 30, effects: { speed: 0, cost: -5, security: 15, trust: 10, adoption: 5, scalability: 10 }, displayOrder: 4 },
    ],
  },
];

export const ADVERSARIES: Adversary[] = [
  { id: "adv1", name: "VENDOR LOCK-IN", spriteName: "lock_box", scenarioType: "vendor_lock_in", description: "Proprietary dependency trap" },
  { id: "adv2", name: "TECH DEBT", spriteName: "debt_box", scenarioType: "compliance", description: "Accumulated technical shortcuts" },
  { id: "adv3", name: "MEGA CORP", spriteName: "corp_boss", scenarioType: "ai_governance", description: "Corporate dominance threat" },
];
