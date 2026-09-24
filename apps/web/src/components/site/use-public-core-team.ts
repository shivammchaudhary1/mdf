"use client";

import { type PublicTeamMember, usePublicTeam } from "./use-public-team";

export type PublicCoreTeamMember = PublicTeamMember;

export function usePublicCoreTeam() {
  return usePublicTeam("Core Team");
}
