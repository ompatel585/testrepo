export function generateUniqueFileName(fileName: string): string {
  const ext = fileName.split('.').pop();
  return Date.now() + '.' + ext;
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop();
}
