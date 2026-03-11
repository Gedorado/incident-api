import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ListIncidentsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
