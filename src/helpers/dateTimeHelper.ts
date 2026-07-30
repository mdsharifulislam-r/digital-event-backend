type DateFilter = "last7Days" | "last30Days" | "thisYear";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function getDateRange(filter: DateFilter): DateRange {
  const now = new Date();

  // End of today
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  let startDate: Date;

  switch (filter) {
    case "last7Days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // Includes today
      startDate.setHours(0, 0, 0, 0);
      break;

    case "last30Days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29); // Includes today
      startDate.setHours(0, 0, 0, 0);
      break;

    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    default:
      throw new Error("Invalid date filter");
  }

  return {
    startDate,
    endDate,
  };
}