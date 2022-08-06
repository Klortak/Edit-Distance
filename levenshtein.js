// https://www.youtube.com/watch?v=We3YDTzNXEk

// Returns an object for the levenshtein functions
function create_object(string = '', percentage = 0, distance = 0) {
  return {
    'string': string,
    'percentage': percentage,
    'distance': distance
  };
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
function add_weight(target, string, min = 0, max = 1) {
  // If parameters are unset the function returns the max weight
  if(!target || !string){
    return 1;
  }

  // A matrix of the keys on a keyboard
  keyboard = [
    '~` !1 @2 #3 $4 %5 ^6 &7 *8 (9 )0 _- += ㅤ ㅤ ',
    'ㅤㅤ Qq Ww Ee Rr Tt Yy Uu Ii Oo Pp {[ }] |\\ ',
    'ㅤㅤ  Aa Ss Dd Ff Gg Hh Jj Kk Ll :; \"\' ㅤ ㅤ',
    'ㅤㅤ ㅤ Zz Xx Cc Vv Bb Nn Mm <, >. ?/ ㅤ ㅤ ㅤ '
  ];

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
      if(key[0] == target || key[1] == target) {
        x1 = x;
        y1 = y;
      }

      // Set variables if key matches main or alternative key
      if(key[0] == string || key[1] == string) {
        x2 = x;
        y2 = y;
      }
    }
  }

  // Calculate weight by using the distance formula
  let x3 = Math.pow(x2 - x1, 2);
  let y3 = Math.pow(y2 - y1, 2);
  let d = Math.sqrt(x3 + y3);

  // The min and max distance apart from a key
  const min_distance = 1
  const max_distance = 10

  // Clamp
  let cd = clamp(d, min_distance, max_distance);
  // Map range
  let md = map(cd, min_distance, max_distance, min, max);

  // Math.pow return NaN if the number is a negative
  // This is a failsafe
  if(!x3 || !y3) {
    return 1;
  }

  return +md.toFixed(2);
}

// Takes a single target and compares it to a possible match and returns the statistics
function levenshtein(target, string, weighted = false, case_sensitive = false) {
  // If both parameters are empty return a default object
  if(!target && !string) {
    return create_object();
  }

  // If the target is empty return the length of the string to be compared to
  if(!target) {
    return create_object(string, 0, string.length);
  }

  // If the string to be compared to is empty return the length of the target
  if(!string) {
    return create_object(target, 0, target.length);
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
        let weight = add_weight(target.charAt(i - 1), string.charAt(j - 1))
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1],
          matrix[i][j - 1],
          matrix[i - 1][j]
        ) + weighted ? weight : 1;
      }
    }
  }

  // Levenshtein distance
  let distance = matrix[target.length][string.length];
  let percentage = 100 - (distance / target.length) * 100;

  // Return an object with the original string, percentage, and distance
  return create_object(original_string, percentage, distance);
}

// Takes a single target and compares it against multiple possible matches and returns the best match
function batch_levenshtein(target, strings, case_sensitive = false, return_all = false) {
  let results = [];
  let percentages = [];
  // For each string to compare
  for(let i = 0; i < strings.length; i++) {
    // Get levenshtein distance
    l = levenshtein(target, strings[i], case_sensitive);
    // Compile results
    results[i] = create_object(l.string, l.percentage, l.distance);
    // Add percentage to array
    percentages.push(l.percentage);
  }

  // If return all is true, return all the results
  if(return_all) return results;

  // Get highest percentage
  let highest = Math.max(...percentages);

  // For each result
  for (let i = 0; i < results.length; i++) {
    // If the highest percentage is the same as the current percentage
    if(highest == results[i].percentage) {
      // Return corresponding object
      return results[i];
    }
  }
}

// Returning different values
//console.log(levenshtein('bonk', 'bonk1'))
//console.log(levenshtein('bonk1', 'bonk'))

// Returning different values
//console.log(levenshtein('bonk', 'bonk1', true))
//console.log(levenshtein('bonk1', 'bonk', true))