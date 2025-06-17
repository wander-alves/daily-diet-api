export function formatDate(date: Date) {
  const splitDate = date.toISOString().split('T')[0];
  const splitHours = date.toTimeString().split(' ')[0];
  return `${splitDate} ${splitHours}`
}