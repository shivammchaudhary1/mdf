import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
const normalizeEmail = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim().toLowerCase() : value);
export class EmailDto {
  @ApiProperty() @IsEmail() @MaxLength(254) @Transform(normalizeEmail) email!: string;
}
export class AccountSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) @Transform(normalizeEmail) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(/^\+?[\d ()-]{7,20}$/) mobile?: string;
}
export class LoginDto extends EmailDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) password!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() remember?: boolean;
}
export class RegisterDto extends EmailDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsString() @Matches(/^\+?[\d ()-]{7,20}$/) mobile!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(128) password!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(128) confirmPassword!: string;
}
export class GoogleAuthDto {
  @ApiProperty() @IsString() @MinLength(100) @MaxLength(5000) credential!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(/^\+?[\d ()-]{7,20}$/) mobile?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() remember?: boolean;
}
export class ResetPasswordDto {
  @ApiProperty() @IsString() @Matches(/^[A-Za-z0-9_-]{40,128}$/) token!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(128) password!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(128) confirmPassword!: string;
}
