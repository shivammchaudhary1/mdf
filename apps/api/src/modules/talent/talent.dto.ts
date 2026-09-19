import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
const booleanValue = ({ value }: { value: unknown }) => (value === "true" ? true : value === "false" ? false : value);
export class TalentQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: ["actor", "writer", "crew"] })
  @IsOptional()
  @IsIn(["actor", "writer", "crew"])
  group?: "actor" | "writer" | "crew";
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(booleanValue)
  @IsBoolean()
  verified?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(booleanValue)
  @IsBoolean()
  suspended?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  skills?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  languages?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  availability?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  experience?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(100)
  ageMin?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(100)
  ageMax?: number;
}
export class UserUpdateDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() verified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() suspended?: boolean;
}
export class TalentListQueryDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  projectId?: string;
}
export class CreateListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  purpose?: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsMongoId({ each: true })
  memberIds?: string[];
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  projectId?: string | null;
}
export class UpdateListDto extends PartialType(CreateListDto) {}
export class ListMemberDto {
  @ApiProperty() @IsMongoId() memberId!: string;
}
