// DB stores these as ints (matching the original EF Core int columns), but the
// JSON API contract uses string names (matching JsonStringEnumConverter on the
// .NET side, and what the React frontend already sends/expects) - so every
// enum needs both directions.

function buildEnum<T extends string>(names: readonly T[]) {
  const toName = (value: number): T => names[value];
  const toValue = (name: string): number => {
    const idx = names.indexOf(name as T);
    if (idx === -1) throw new Error(`Invalid enum value: ${name}`);
    return idx;
  };
  return { names, toName, toValue };
}

export const AppointmentStatus = buildEnum([
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const);

export const B2BBusinessType = buildEnum([
  "HospitalClinic",
  "Corporate",
] as const);

export const B2BInquiryStatus = buildEnum([
  "New",
  "Contacted",
  "Closed",
] as const);
