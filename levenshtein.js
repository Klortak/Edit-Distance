// https://www.youtube.com/watch?v=We3YDTzNXEk

// Returns an object for the levenshtein functions
function create_object(string = '', percentage = 0, distance = 0) {
  return {
    'string': string,
    'percentage': percentage,
    'distance': distance
  }
}

// Takes a single target and compares it to a possible match and returns the statistics
function levenshtein(target, string, case_sensitive = false) {
  // If both parameters are empty return a default object
  if(!target && !string) {
    return create_object()
  }

  // If the target is empty return the length of the string to be compared to
  if(!target) {
    return create_object(string, 0, string.length);
  }

  // If the string to be compared to is empty return the length of the target
  if(!string) {
    return create_object(target, 0, target.length)
  }

  // Lowercase both strings if case insensitive
  if(!case_sensitive) {
    original_string = string;

    target = target.toLowerCase();
    string = string.toLowerCase();
  }

  let matrix = [];

  // X Axis
  for(i = 0; i <= target.length; i++) {
    matrix[i] = [i];
  }

  // Y Axis
  for(j = 0; j <= string.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= target.length; i++) {
    for(j = 1; j <= string.length; j++) {
      // If the characters are the same, don't change the value
      if(target.charAt(i - 1) == string.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      }
      // Otherwise set it to the minimum of the three values 
      else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1],
          matrix[i][j - 1],
          matrix[i - 1][j]
        ) + 1;
      }
    }
  }

  // Levenshtein distance
  let distance = matrix[target.length][string.length];
  let percentage = 100 - (distance / target.length) * 100;

  // Return an object with the original string, percentage, and distance
  return create_object(original_string, percentage, distance);
}