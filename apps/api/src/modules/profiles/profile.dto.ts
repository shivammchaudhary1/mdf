import { ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsMongoId, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  experience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  availability?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  photoMediaId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsMongoId({ each: true })
  portfolioMediaIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsUrl({ protocols: ["https"], require_protocol: true }, { each: true })
  videos?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({
    protocols: ["https"],
    require_protocol: true,
  })
  @MaxLength(500)
  showreel?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  previousWork?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ protocols: ["https"], require_protocol: true }, { each: true })
  socialLinks?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  resumeMediaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  publicVisible?: boolean;
}

export class MemberSettingsDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  savedOpportunityIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  publicVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailCastingAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailUpdates?: boolean;
}
