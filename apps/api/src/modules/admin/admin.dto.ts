import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMongoId, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const trimText = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class AdminProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(trimText)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^$|^\+?[\d ()-]{7,20}$/)
  @Transform(trimText)
  mobile?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  photoMediaId?: string | null;
}
