import {
  leadActivityTypes,
  leadPriorities,
  leadStatuses,
  standardCallOutcomes,
  standardLeadSources,
} from "../src/modules/leads/lead.model";

describe("lead CRM controlled values", () => {
  it("keeps the agreed pipeline statuses", () => {
    expect(leadStatuses).toEqual([
      "NEW",
      "CONTACTED",
      "INTERESTED",
      "FOLLOW_UP",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "CONVERTED",
      "LOST",
      "ON_HOLD",
    ]);
  });

  it("supports controlled dropdowns with an Other escape hatch", () => {
    expect(leadPriorities).toEqual(["LOW", "MEDIUM", "HIGH", "URGENT"]);
    expect(standardLeadSources).toContain("Other");
    expect(standardCallOutcomes).toContain("Other");
    expect(leadActivityTypes).toContain("CALL");
    expect(leadActivityTypes).toContain("FOLLOW_UP");
  });
});
