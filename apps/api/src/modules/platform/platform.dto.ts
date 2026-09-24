import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
export class ContentDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() publishedAt?: string | null;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @ApiProperty() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(160) slug!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1500) description?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(10000, { each: true })
  body?: string[];
  @ApiPropertyOptional() @IsOptional() @IsMongoId() coverMediaId?: string | null;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(50) @IsMongoId({ each: true }) mediaIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() published?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) role?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ["https"], require_protocol: true }) @MaxLength(500) videoUrl?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(10000) order?: number;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() projectId?: string | null;
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() data?: Record<string, string>;
}
export class UpdateContentDto extends PartialType(ContentDto) {}
export class ContentQueryDto extends PageQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() projectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) tag?: string;
  @ApiPropertyOptional({ enum: ["newest", "oldest", "title-asc", "title-desc", "order", "updated", "published"] })
  @IsOptional()
  @IsIn(["newest", "oldest", "title-asc", "title-desc", "order", "updated", "published"])
  sort?: string;
}
