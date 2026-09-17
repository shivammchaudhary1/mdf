import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class EmailDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  email!: string;
}
export class LoginDto extends EmailDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) password!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() remember?: boolean;
}
export class RegisterDto extends EmailDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsString() @Matches(/^\+?[\d ()-]{7,20}$/) mobile!: string;
  @ApiProperty() @IsString() @MinLength(8) @MaxLength(128) password!: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmPassword!: string;
}
export class ResetPasswordDto {
  @ApiProperty() @IsString() @Matches(/^[a-f0-9]{64}$/) token!: string;
  @ApiProperty() @IsString() @MinLength(8) @MaxLength(128) password!: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmPassword!: string;
}
