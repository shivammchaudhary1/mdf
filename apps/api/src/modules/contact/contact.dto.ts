import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

import { PageQueryDto } from "../../common/dto/pagination.dto";
import { contactStatuses } from "./contact.model";
export class ContactDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) subject!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(5000) message!: string;
}
export class ContactQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: contactStatuses }) @IsOptional() @IsIn(contactStatuses) status?: string;
}
export class ContactUpdateDto {
  @ApiProperty({ enum: contactStatuses }) @IsIn(contactStatuses) status!: string;
}
