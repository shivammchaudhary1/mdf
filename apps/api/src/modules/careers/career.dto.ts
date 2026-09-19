import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
import { type CareerStatus, careerStatuses } from "./career.model";

const normalizeEmail = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim().toLowerCase() : value);

export class CreateCareerApplicationDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsEmail() @MaxLength(254) @Transform(normalizeEmail) email!: string;
  @ApiProperty() @IsString() @Matches(/^\+?[\d ()-]{7,20}$/) mobile!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) role!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiProperty() @IsString() @MinLength(20) @MaxLength(5000) coverNote!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ["https"], require_protocol: true }) @MaxLength(700) resumeUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ["https"], require_protocol: true }) @MaxLength(700) portfolioUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ["https"], require_protocol: true }) @MaxLength(700) linkedinUrl?: string;
}

export class CareerQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: careerStatuses }) @IsOptional() @IsIn(careerStatuses) status?: CareerStatus;
}

export class UpdateCareerApplicationDto {
  @ApiProperty({ enum: careerStatuses }) @IsIn(careerStatuses) status!: CareerStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) adminNotes?: string;
}
