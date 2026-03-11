export function getFullName(firstName, middleName, lastName) {
  return [firstName, middleName, lastName]
    .filter((part) => part && part.trim())
    .join(' ');
}
