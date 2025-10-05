export default function handleDataUpdate<T extends Record<string, any>>(
  newData: T,
  oldData: T
): { hasntChanges: boolean; data: T } {
  const obj: T = {} as T;

  for (const [key, value] of Object.entries(newData)) {
    if (!value || value === oldData[key as keyof typeof oldData]) {
      continue;
    }
    obj[key as keyof typeof newData] = value as any;
  }
  return { hasntChanges: Object.keys(obj).length === 0, data: obj };
}
