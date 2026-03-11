export function ImageNameGenerator(mimeType: string, imgType: string) {
  const parts = mimeType.split('/');
  const imageExtension = parts[1];
  const timestamp = new Date().valueOf().toString();

  const imgName = `${imgType}-${timestamp}.${imageExtension}`;
  return imgName;
}
