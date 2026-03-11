export function jsonToQuerySting(data: Record<string, any>) {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

export function queryStingToJson(data: string): Record<string, any> {
  const queryParams = new URLSearchParams(data);

  return Object.fromEntries(queryParams.entries());
}

export function sanitizeObject(obj: any, sensitiveKeys: string[] = []): any {
  if (!obj || typeof obj !== 'object') return obj;

  const clone: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      clone[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      clone[key] = sanitizeObject(value, sensitiveKeys);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}
