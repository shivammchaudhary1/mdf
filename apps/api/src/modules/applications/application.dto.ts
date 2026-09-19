import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsIn, IsMongoId, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
import { applicationStatuses, opportunityTypes } from "./application.model";

type ApplicationStatus = (typeof applicationStatuses)[number];
type OpportunityType = (typeof opportunityTypes)[number];

export class CreateApplicationDto {
  @ApiProperty()
  @IsMongoId()
  opportunityId!: string;

  @ApiPropertyOptional({ enum: opportunityTypes })
  @IsOptional()
  @IsIn(opportunityTypes)
  opportunityType?: OpportunityType;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  coverNote!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsMongoId({ each: true })
  portfolioMediaIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({
    protocols: ["https"],
    require_protocol: true,
  })
  @MaxLength(500)
  showreelUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  pitch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  documentMediaId?: string;
}

export class UpdateApplicationDto {
  @ApiProperty({ enum: applicationStatuses })
  @IsIn(applicationStatuses)
  status!: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  adminNotes?: string;
}

export class MemberApplicationQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: applicationStatuses })
  @IsOptional()
  @IsIn(applicationStatuses)
  status?: ApplicationStatus;
}

export class AdminApplicationQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: applicationStatuses })
  @IsOptional()
  @IsIn(applicationStatuses)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ enum: opportunityTypes })
  @IsOptional()
  @IsIn(opportunityTypes)
  opportunityType?: OpportunityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  opportunityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  projectId?: string;
}

export class OpportunityQueryDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
