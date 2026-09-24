import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model } from "mongoose";

import { Account } from "./auth.models";
import { MemberSequence } from "./member-sequence.model";

const INDIA_OFFSET_MS = 330 * 60_000;
const VALID_MEMBER_CODE = /^mdf\d{9,}$/;

type AccountCodeRow = Pick<Account, "_id" | "memberCode" | "createdAt">;

@Injectable()
export class MemberCodeService {
  private backfillPromise?: Promise<void>;
  private readonly seededMonths = new Set<string>();

  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("MemberSequence") private readonly sequences: Model<MemberSequence>,
  ) {}

  private monthKey(value: Date) {
    const india = new Date(value.getTime() + INDIA_OFFSET_MS);
    return `${india.getUTCFullYear()}${String(india.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  private code(month: string, sequence: number) {
    return `mdf${month}${String(sequence).padStart(3, "0")}`;
  }

  private async seedMonth(month: string) {
    if (this.seededMonths.has(month)) return;

    const matcher = new RegExp(`^mdf${month}\\d{3,}$`);
    const existing = await this.accounts.find({ role: "MEMBER", memberCode: matcher }).select("memberCode").lean();

    let maxSequence = 0;
    for (const member of existing) {
      const raw = typeof member.memberCode === "string" ? member.memberCode.slice(9) : "";
      const parsed = Number(raw);
      if (Number.isInteger(parsed) && parsed > maxSequence) maxSequence = parsed;
    }

    await this.sequences.updateOne(
      { _id: month },
      { $max: { seq: maxSequence } },
      { upsert: true },
    );

    this.seededMonths.add(month);
  }

  private async reserve(month: string, count: number) {
    await this.seedMonth(month);

    const sequence = await this.sequences
      .findOneAndUpdate(
        { _id: month },
        { $inc: { seq: count } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .lean();

    if (!sequence) throw new Error("Unable to allocate MDF Member ID.");

    return sequence.seq - count + 1;
  }

  private async backfillLegacyCodes() {
    const members = await this.accounts
      .find({ role: "MEMBER" })
      .select("_id memberCode createdAt")
      .sort({ createdAt: 1, _id: 1 })
      .lean<AccountCodeRow[]>();

    const legacy = members.filter((member) => !VALID_MEMBER_CODE.test(member.memberCode ?? ""));
    if (!legacy.length) return;

    const byMonth = new Map<string, AccountCodeRow[]>();

    for (const member of legacy) {
      const month = this.monthKey(member.createdAt ?? new Date());
      const rows = byMonth.get(month) ?? [];
      rows.push(member);
      byMonth.set(month, rows);
    }

    for (const [month, rows] of byMonth) {
      const start = await this.reserve(month, rows.length);

      await this.accounts.bulkWrite(
        rows.map((member, index) => ({
          updateOne: {
            filter: { _id: member._id },
            update: { $set: { memberCode: this.code(month, start + index) } },
          },
        })),
        { ordered: true },
      );
    }
  }

  async ensureLegacyCodes() {
    if (!this.backfillPromise) {
      this.backfillPromise = this.backfillLegacyCodes().finally(() => {
        this.backfillPromise = undefined;
      });
    }

    await this.backfillPromise;
  }

  async next(value = new Date()) {
    await this.ensureLegacyCodes();
    const month = this.monthKey(value);
    const sequence = await this.reserve(month, 1);
    return this.code(month, sequence);
  }
}
