// Commission distribution rates
export const HIERARCHY_POOL = 0.8; // 80% goes to agents
export const COMPANY_RATE = 0.2; // 20% goes to company

// Each level's share of the hierarchy pool (80%)
export const LEVEL_RATES = {
  1: 0.5, // 50% of pool = 40% of revenue
  2: 0.3, // 30% of pool = 24% of revenue
  3: 0.2, // 20% of pool = 16% of revenue
};

export const LeadStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

export const Role = {
  AGENT: "AGENT",
  MANAGER: "MANAGER",
};
