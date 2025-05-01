
/**
 * Safely stringify an object to JSON
 * @param data The data to convert to a JSON string
 */
export const safeJsonStringify = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error stringifying data:", error);
    return "{}";
  }
};

/**
 * Safely parse a JSON string to an object
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value if parsing fails
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return fallback;
  }
};
