// generates OTP with default 4-digit
export function generateOtp(otpLength: number = 4): string {
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}
