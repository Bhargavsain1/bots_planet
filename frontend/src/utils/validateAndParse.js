function parseTypedValue(value, expectedType) {
  if (expectedType === "Number") {
    const parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }

  if (expectedType === "Boolean") {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  }

  if (expectedType === "Date") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  }

  if (expectedType === "Array") {
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  }

  if (expectedType === "Object") {
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
        ? parsed
        : value;
    } catch {
      return value;
    }
  }

  // Fallback to string
  return String(value);
}

function isValidType(value, expectedType) {
  if (expectedType === "String") return typeof value === "string";

  if (expectedType === "Number")
    return typeof value === "number" && !isNaN(value);

  if (expectedType === "Boolean") return typeof value === "boolean";

  if (expectedType === "Date")
    return value instanceof Date && !isNaN(value.getTime());

  if (expectedType === "Array") return Array.isArray(value);

  if (expectedType === "Object")
    return typeof value === "object" && value !== null && !Array.isArray(value);

  return false;
}

export { parseTypedValue, isValidType };
