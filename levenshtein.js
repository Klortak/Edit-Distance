// https://www.youtube.com/watch?v=We3YDTzNXEk

// Returns an object for the levenshtein functions
function create_object(string = '', percentage = 0, distance = 0) {
  return {
    'string': string,
    'percentage': percentage,
    'distance': distance
  }
}

// Returns a number mapped to a given range
function map(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Returns a number clamped from a given minimum and maximum
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Returns a number based on a keyboard key's distance from another
function add_weight(string, target) {
  // Bail if parameters are undefined
  if(!string || !target){
    return 1;
  }

  // A matrix of the keys on a keyboard
  keyboard = [
    '~` !1 @2 #3 $4 %5 ^6 &7 *8 (9 )0 _- += ㅤ ㅤ ',
    'ㅤㅤ Qq Ww Ee Rr Tt Yy Uu Ii Oo Pp {[ }] |\\ ',
    'ㅤㅤ  Aa Ss Dd Ff Gg Hh Jj Kk Ll :; \"\' ㅤ ㅤ',
    'ㅤㅤ ㅤ Zz Xx Cc Vv Bb Nn Mm <, >. ?/ ㅤ ㅤ ㅤ '
  ]

  // Declare points
  let x1;
  let x2;
  let y1;
  let y2;

  // For each row
  for(x = 0; x < keyboard.length; x++) {
    // For each element in the row
    for(y = 0; y < keyboard[x].split(' ').length; y++) {
      let key = keyboard[x].split(' ')[y];
      // Set variables if key matches main or alternative key
      if(key[0] == string || key[1] == string) {
        x1 = x;
        y1 = y;
      }
      // Set variables if key matches main or alternative key
      if(key[0] == target || key[1] == target) {
        x2 = x;
        y2 = y;
      }
    }
  }

  // Calculate weight by using the distance formula
  let x3 = Math.pow(x2 - x1, 2);
  let y3 = Math.pow(y2 - y1, 2);
  let d = Math.sqrt(x3 + y3);
  // Clamp
  let cd = clamp(d, 0, 10);
  // Map range
  let md = map(cd, 0, 10, 0, 1);

  return +md.toFixed(2);
}

// Takes a single target and compares it to a possible match and returns the statistics
function levenshtein(target, string, weighted = false, case_sensitive = false) {
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
        ) + weighted ? add_weight(target.charAt(i - 1), string.charAt(j - 1)) : 1;
      }
    }
  }

  // Levenshtein distance
  let distance = matrix[target.length][string.length];
  let percentage = 100 - (distance / target.length) * 100;

  // Return an object with the original string, percentage, and distance
  return create_object(original_string, percentage, distance);
}