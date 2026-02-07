import { IsNotEmpty, IsOptional } from 'class-validator';

// objective: 'Awareness',
// format: 'Long Caption',
// focus: 'AI Content Planner Feature',
// occasion: 'None',
// overrideLanguage: 'No Override',
// overrideCTAUrl: '',
// ctaIntent: 'Soft (Learn more)'

export class ContentStrategyDto {
  @IsNotEmpty()
  objective: string;

  @IsNotEmpty()
  format: string;

  @IsOptional()
  focus: string;

  @IsNotEmpty()
  occasion: string;

  @IsNotEmpty()
  overrideLanguage: string;

  @IsOptional()
  overrideCTAUrl: string;

  @IsNotEmpty()
  ctaIntent: string;
}
