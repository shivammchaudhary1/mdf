import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDateString, IsEmail, IsIn, IsMongoId, IsNumber, IsOptional, IsString, IsUrl, Matches, MaxLength, Min } from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
import { type LeadActivityType, leadActivityTypes, leadPriorities, type LeadPriority, type LeadStatus,leadStatuses } from "./lead.model";

const phonePattern = /^$|^\+?[\d ()-]{7,24}$/;

export class CreateLeadDto {
  @ApiProperty() @IsString() @MaxLength(180) companyName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(phonePattern) mobile?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ["http", "https"], require_protocol: true }) @MaxLength(700) website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @MaxLength(120, { each: true }) services?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) source?: string;
  @ApiPropertyOptional({ enum: leadStatuses }) @IsOptional() @IsIn(leadStatuses) status?: LeadStatus;
  @ApiPropertyOptional({ enum: leadPriorities }) @IsOptional() @IsIn(leadPriorities) priority?: LeadPriority;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) estimatedValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) convertedValue?: number;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsMongoId() assignedTo?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsDateString() nextFollowUpAt?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) lostReason?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(180) companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) contactPerson?: string;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @Matches(phonePattern) mobile?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsEmail() @MaxLength(254) email?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUrl({ protocols: ["http", "https"], require_protocol: true }) @MaxLength(700) website?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(120) city?: string | null;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @MaxLength(120, { each: true }) services?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) source?: string;
  @ApiPropertyOptional({ enum: leadStatuses }) @IsOptional() @IsIn(leadStatuses) status?: LeadStatus;
  @ApiPropertyOptional({ enum: leadPriorities }) @IsOptional() @IsIn(leadPriorities) priority?: LeadPriority;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(0) estimatedValue?: number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(0) convertedValue?: number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsMongoId() assignedTo?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsDateString() nextFollowUpAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(1000) lostReason?: string | null;
}

export class LeadQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: leadStatuses }) @IsOptional() @IsIn(leadStatuses) status?: LeadStatus;
  @ApiPropertyOptional({ enum: leadPriorities }) @IsOptional() @IsIn(leadPriorities) priority?: LeadPriority;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) source?: string;
  @ApiPropertyOptional({ enum: ["TODAY", "OVERDUE", "UPCOMING"] }) @IsOptional() @IsIn(["TODAY", "OVERDUE", "UPCOMING"]) followUp?: string;
  @ApiPropertyOptional({ enum: ["true", "false"] }) @IsOptional() @IsIn(["true", "false"]) archived?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() assignedTo?: string;
}

export class LeadActivityDto {
  @ApiProperty({ enum: leadActivityTypes }) @IsIn(leadActivityTypes) type!: LeadActivityType;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) callOutcome?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() followUpAt?: string;
}

export class LeadActivityQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: leadActivityTypes }) @IsOptional() @IsIn(leadActivityTypes) type?: LeadActivityType;
}

export class LeadDuplicateQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) mobile?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() excludeId?: string;
}
