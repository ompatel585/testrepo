import * as crypto from 'crypto';

export function generatePassword(length: number = 8): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%&*()+[]{}<>?';
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure password includes at least one of each type
  const passwordArray = [
    uppercase[crypto.randomInt(0, uppercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    special[crypto.randomInt(0, special.length)],
  ];

  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    passwordArray.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Shuffle the array to randomize character positions
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}
