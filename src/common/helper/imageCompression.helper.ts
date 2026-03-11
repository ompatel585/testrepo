import { imageCompressionContext, imageCompressionTypes } from '../constants';
import { imageType } from '../utils/imageCompression.util';
import { getWorkImageSizeFactor, getWorkWidthRatio } from './workImageCompression.helper';

export const imageSizeQualityFactor = [
  {
    context: imageCompressionContext.work,
    func: (fileSizeKB: number) => getWorkImageSizeFactor(fileSizeKB),
  },
];

export const skipCompressionCriteria = [
  {
    context: imageCompressionContext.work,
    imageType: imageCompressionTypes.view,
    maxSize: 300, // in KB
  },
  {
    context: imageCompressionContext.work,
    imageType: imageCompressionTypes.thumbnail,
    maxSize: 200, // in KB
  },
];

export const imageCompressionWidthRatio = [
  {
    context: imageCompressionContext.work,
    func: (originalWidth: number, originalHeight: number, imageType: imageType) =>
      getWorkWidthRatio(originalWidth, originalHeight, imageType),
  },
];

export const adjustImageFactors = [
  { context: imageCompressionContext.work, referenceWidth: 2000, multiplier: 2.5 },
];
