import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;
}
