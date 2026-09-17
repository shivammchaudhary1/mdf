import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from "@nestjs/swagger";
import { PageQueryDto } from "../../common/dto/pagination.dto";
import { projectStatuses } from "./project.model";

type ProjectStatus = (typeof projectStatuses)[number];

export class ProjectCreditDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  role!: string;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(160)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(15_000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(10_000, { each: true })
  body?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  creditsText?: string;

  @ApiPropertyOptional({ enum: projectStatuses })
  @IsOptional()
  @IsIn(projectStatuses)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  coverMediaId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  galleryMediaIds?: string[];

  @ApiPropertyOptional({ type: [ProjectCreditDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProjectCreditDto)
  credits?: ProjectCreditDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({
    protocols: ["https"],
    require_protocol: true,
  })
  @MaxLength(500)
  trailerUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  order?: number;
}

export class UpdateProjectDto extends PartialType(
  CreateProjectDto,
) {}

export class ProjectQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: projectStatuses })
  @IsOptional()
  @IsIn(projectStatuses)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tag?: string;
}
