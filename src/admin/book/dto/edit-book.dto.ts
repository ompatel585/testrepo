import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  ArrayNotEmpty,
  IsDefined,
  IsNumber,
  IsIn,
  IsUrl,
  ValidationArguments,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { IsStringOrQuizArray } from 'src/common/validation/IsStringOrQuizArray';

const resourceMessageMap = {
  pdf: 'file',
  video: 'file',
  link: 'url',
  download: 'zip-file',
  audio: 'file',
  quiz: 'json',
  videoLink: 'url',
  html: 'file',
};

export enum ResourceTypeEnum {
  PDF = 'pdf',
  VIDEO = 'video',
  LINK = 'link',
  DOWNLOAD = 'download',
  AUDIO = 'audio',
  QUIZ = 'quiz',
  VIDEOLINK = 'videoLink',
  HTML = 'html',
  SESSION = 'session',
  DRM_BOOK = 'drmBook',
}

export enum SessionTypeEnum {
  PDF = 'pdf',
  VIDEO = 'video',
  LINK = 'link',
  DOWNLOAD = 'download',
  AUDIO = 'audio',
  QUIZ = 'quiz',
  VIDEOLINK = 'videoLink',
  HTML = 'html',
  DRM_BOOK = 'drmBook',
}

export class MultiTrueFalseOption {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  answer: string;
}

export enum QuizTypeEnum {
  SingleSelect = 'singleSelect',
  MultiSelect = 'multiSelect',
  TrueOrFalse = 'trueOrFalse',
  MultiTrueOrFalse = 'multiTrueOrFalse',
  ArrangeInSequence = 'arrangeInSequence',
  MatchColumn = 'matchColumn',
}

export const answerMustString = [QuizTypeEnum.SingleSelect, QuizTypeEnum.TrueOrFalse];
export const answerMustStringArray = [
  QuizTypeEnum.MultiSelect,
  QuizTypeEnum.MultiTrueOrFalse,
  QuizTypeEnum.ArrangeInSequence,
  QuizTypeEnum.MatchColumn,
];

export class Quiz {
  @IsEnum(QuizTypeEnum)
  type: QuizTypeEnum;

  @IsNotEmpty()
  @IsString()
  question: string;

  @ValidateIf((object) => object.type !== QuizTypeEnum.MatchColumn)
  options: string[] | MultiTrueFalseOption[];

  @ValidateIf((object) => object.type === QuizTypeEnum.MatchColumn)
  @IsArray()
  @IsString({ each: true })
  option1?: string[];

  @ValidateIf((object) => object.type === QuizTypeEnum.MatchColumn)
  @IsArray()
  @IsString({ each: true })
  option2?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  answer: string | string[];
}

class SessionResource {
  @IsNotEmpty()
  @IsEnum(SessionTypeEnum)
  type: SessionTypeEnum;

  @ValidateIf((obj) => {
    if (obj.type == SessionTypeEnum.QUIZ) {
      return false;
    }
    return true;
  })
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} title is required`;
    },
  })
  @IsString()
  title: string;

  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} ${resourceMessageMap[obj.type]} is required`;
    },
  })
  @IsDefined()
  @IsStringOrQuizArray()
  value: string | Quiz[];

  @ValidateIf((o) =>
    [
      ResourceTypeEnum.PDF,
      ResourceTypeEnum.VIDEO,
      ResourceTypeEnum.AUDIO,
      ResourceTypeEnum.DOWNLOAD,
    ].includes(o.type),
  )
  @Expose()
  @Transform(({ value, obj }) => {
    if (value) return value; // If already present, keep it

    if (typeof obj.value === 'string') {
      const parts = obj.value.split('/');
      return parts[parts.length - 1]; // Get last segment
    }
    return undefined;
  })
  @IsString()
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} fileName is required`;
    },
  })
  fileName: string;

  @ValidateIf(
    (o) => o.type === SessionTypeEnum.LINK || o.type === SessionTypeEnum.VIDEOLINK,
  )
  @IsUrl(
    {},
    {
      message: (args: ValidationArguments) => {
        // Cast args.object to the DTO type to access the "type" property.
        const obj = args.object as Resource;
        return `${obj.type} must be a valid URL`;
      },
    },
  )
  get isValidValue(): string {
    return typeof this.value === 'string' ? this.value : '';
  }

  @IsOptional()
  thumbnail: string;

  @IsString()
  @ValidateIf((o) => o.thumbnail)
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `thumbnailName is required`;
    },
  })
  thumbnailName: string;
}
class Resource {
  @IsNotEmpty()
  @IsEnum(ResourceTypeEnum)
  type: ResourceTypeEnum;

  @ValidateIf((obj) => {
    if (obj.type == ResourceTypeEnum.QUIZ) {
      return false;
    }
    return true;
  })
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} title is required`;
    },
  })
  @IsString()
  title: string;

  @ValidateIf((o) => o.type !== ResourceTypeEnum.SESSION)
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} ${resourceMessageMap[obj.type]} is required`;
    },
  })
  @IsDefined()
  @IsStringOrQuizArray()
  value?: string | Quiz[];

  @ValidateIf((o) =>
    [
      ResourceTypeEnum.PDF,
      ResourceTypeEnum.VIDEO,
      ResourceTypeEnum.AUDIO,
      ResourceTypeEnum.DOWNLOAD,
    ].includes(o.type),
  )
  @Expose()
  @Transform(({ value, obj }) => {
    if (value) return value; // If already present, keep it
    if (typeof obj.value === 'string') {
      const parts = obj.value.split('/');
      return parts[parts.length - 1]; // Get last segment
    }
    return undefined;
  })
  @IsString()
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `${obj.type} fileName is required`;
    },
  })
  fileName: string;

  @ValidateIf((o) => o.type === ResourceTypeEnum.SESSION)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionResource)
  @ArrayNotEmpty()
  sessionValue: SessionResource[];

  @ValidateIf(
    (o) => o.type === ResourceTypeEnum.LINK || o.type === ResourceTypeEnum.VIDEOLINK,
  )
  @IsUrl(
    {},
    {
      message: (args: ValidationArguments) => {
        // Cast args.object to the DTO type to access the "type" property.
        const obj = args.object as Resource;
        return `${obj.type} must be a valid URL`;
      },
    },
  )
  get isValidValue(): string {
    return typeof this.value === 'string' ? this.value : '';
  }

  @IsOptional()
  thumbnail: string;

  @IsString()
  @ValidateIf((o) => o.thumbnail)
  @IsNotEmpty({
    message: (args: ValidationArguments) => {
      const obj = args.object as Resource;
      return `thumbnailName is required`;
    },
  })
  thumbnailName: string;
}

class SessionSection {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionResource)
  @ArrayNotEmpty()
  sessionResources: SessionResource[];
}
class Section {
  @IsNotEmpty({ message: 'section title is required' })
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isTrainerSection: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Resource)
  // @ValidateIf((obj) => {
  //   return obj.active || obj.resources.length > 0;
  // })
  @ArrayNotEmpty()
  resources: Resource[];
}

export class EditBookDto {
  @IsNotEmpty({ message: 'Book title is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  thumbnail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Section)
  sections: Section[];

  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  canComment: number;
}
