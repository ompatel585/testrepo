import { BusinessException } from '../exceptions/business.exception';
import {
  INVALID_INPUT_FORMAT,
  INVALID_COMMA_SEPERATED_IDS,
} from '../json/error-messages.json';

export function stringToNumberArrayTransform(value: any): number[] {
  /**
   * Ensures the provided value is either a string or an array,
   * for transforming it into an array of numeric IDs if applicable.
   */
  if (typeof value !== 'string' && !(value instanceof Array)) {
    throw new BusinessException(INVALID_INPUT_FORMAT);
  }

  const stringValue = Array.isArray(value) ? value.join(',') : value;
  /**
   * checks following special char, extra or trailing commas and alphabates
   * should not be present
   */
  const regex = /^[0-9]+(?:,[0-9]+)*$/;

  if (!regex.test(stringValue)) {
    throw new BusinessException(INVALID_COMMA_SEPERATED_IDS);
  }

  return (stringValue.match(/\d+/g) || []).map(Number);
}
