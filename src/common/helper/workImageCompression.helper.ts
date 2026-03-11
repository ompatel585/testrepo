import { imageCompressionContext, imageCompressionTypes } from '../constants';
import { CompressionCriteria, imageType } from '../utils/imageCompression.util';

export const thumbnailQualityCriteria: CompressionCriteria[] = [
  /**
   * quality:100 for very low size images to skip compression!
   */
  { minSize: 0, maxSize: 100, quality: 100 },
  { minSize: 101, maxSize: 200, quality: 100 },
  { minSize: 201, maxSize: 500, quality: 90 },
  { minSize: 501, maxSize: 1000, quality: 90 },
  { minSize: 1001, maxSize: 1500, quality: 85 },
  { minSize: 1001, maxSize: 2000, quality: 80 },
  { minSize: 2001, maxSize: 3000, quality: 75 },
  { minSize: 3001, maxSize: 5000, quality: 75 },
  { minSize: 5001, maxSize: Infinity, quality: 70 },
];

export const viewQualityCriteria: CompressionCriteria[] = [
  /**
   * quality:100 for very low size images to skip compression!
   */
  { minSize: 0, maxSize: 100, quality: 100 },
  { minSize: 101, maxSize: 200, quality: 100 },
  /**
   * To avoid an increase in image size instead of decreasing, set lower quality for low-siz images.
   * during view-type compression. This ensures that smaller images are compressed effectively.
   * without unintended size inflation.
   */
  { minSize: 201, maxSize: 300, quality: 85 },
  { minSize: 301, maxSize: 400, quality: 85 },
  { minSize: 401, maxSize: 500, quality: 95 },
  { minSize: 501, maxSize: 600, quality: 95 },
  { minSize: 601, maxSize: 700, quality: 95 },
  { minSize: 701, maxSize: 800, quality: 90 },
  { minSize: 801, maxSize: 1000, quality: 90 },
  { minSize: 1001, maxSize: 2000, quality: 85 },
  { minSize: 2001, maxSize: 3000, quality: 85 },
  { minSize: 3001, maxSize: 4000, quality: 80 },
  { minSize: 4001, maxSize: 5000, quality: 75 },
  { minSize: 5001, maxSize: Infinity, quality: 75 },
];

/**
 * Calculates the image size factor based on the file size (in KB) and the width ratio of the image.
 * The factor is inversely proportional to the file size — smaller images will have a higher factor,
 * which helps adjust the quality during compression. For smaller images with larger dimensions,
 * the width ratio is used to fine-tune the compression quality, ensuring that the final output maintains an optimal balance between file size and visual fidelity.
 *
 * This approach also helps in avoiding an increase in image size instead of a decrease, especially for low-size (KB) images
 *
 * @param fileSizeKB - The size of the image in kilobytes.
 * @returns A numeric factor used for compressing the image based on its size and width ratio.
 */
export function getWorkImageSizeFactor(fileSizeKB: number): number {
  if (fileSizeKB < 400) return 8.0;
  if (fileSizeKB < 500) return 7;
  if (fileSizeKB < 600) return 6.5;
  if (fileSizeKB < 700) return 6;
  if (fileSizeKB < 900) return 5;
  if (fileSizeKB < 1000) return 4;
  if (fileSizeKB < 1500) return 3.5;
  if (fileSizeKB < 2000) return 3;
  return 1.5;
}

/**
 * Gives ratio of original image width and compressed image width
 */
export const getWorkWidthRatio = (
  originalWidth: number,
  originalHeight: number,
  imageType: imageType,
) => {
  let widthRatio = 1;
  const aspectRatio = originalWidth / originalHeight; // Calculate aspect ratio

  if (imageType === 'thumbnail') {
    if (originalWidth >= 4000) {
      widthRatio = 0.15;
    } else if (originalWidth >= 2000) {
      widthRatio = 0.2;
    } else {
      widthRatio = 0.3;
    }

    // if (aspectRatio > 1.5) {
    //   // Wide images
    //   widthRatio = Math.max(widthRatio * 0.8, 0.5);
    // } else if (aspectRatio < 0.8) {
    //   // Tall images
    //   widthRatio = Math.min(widthRatio * 1.2, 1);
    // }
  } else if (imageType === 'view') {
    if (originalWidth >= 2000) {
      widthRatio = 0.75;
    } else {
      widthRatio = 1;
    }
    /**
     * useful in case of image distortion mainly in vertically long images!
     */

    // if (aspectRatio > 1.5) {
    //   // Wide images
    //   widthRatio = Math.max(widthRatio * 0.8, 0.5);
    // } else if (aspectRatio < 0.8) {
    //   // Tall images
    //   widthRatio = Math.min(widthRatio * 1.2, 1);
    // }
  }
  return widthRatio;
};
