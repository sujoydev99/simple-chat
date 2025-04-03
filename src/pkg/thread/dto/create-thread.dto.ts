import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({ example: 'Discussion about AI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
} 