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
function add_keyboard_influence(a, b, min = 0, max = 1) {
  // If parameters are unset the function returns the minimum weight
  if(a == ' ' || b == ' '){
    return 0;
  }

  // A matrix of the keys on a keyboard
  keyboard = [
    ['~`', '!1', '@2', '#3', '$4', '%5', '^6', '&7', '*8', '(9', ')0', '_-', '+='],
    [0, 'Qq', 'Ww', 'Ee', 'Rr', 'Tt', 'Yy', 'Uu', 'Ii', 'Oo', 'Pp', '{[', '}]', '|\\'],
    [0, 0, 'Aa', 'Ss', 'Dd', 'Ff', 'Gg', 'Hh', 'Jj', 'Kk', 'Ll', ':;', '\"\''],
    [0, 0, 0, 'Zz', 'Xx', 'Cc', 'Vv', 'Bb', 'Nn', 'Mm', '<,', '>.', '?/']
  ];

  // Declare points
  let x1, y1, x2, y2;

  // For each row
  for(x = 0; x < keyboard.length; x++) {
    // For each element in the row
    for(y = 0; y < keyboard[x].length; y++) {

      let key = keyboard[x][y][0];
      let alt = keyboard[x][y][1];

      // Does a check for the main key and the alternative one

      // Set coordinate if key matches
      if(key == a || alt == a) {
        x1 = x;
        y1 = y;
      }

      // Set coordinate if key matches
      if(key == b || alt == b) {
        x2 = x;
        y2 = y;
      }
    }
  }

  // Calculate the distance between the two points
  let x3 = Math.pow(x2 - x1, 2);
  let y3 = Math.pow(y2 - y1, 2);
  let d = Math.sqrt(x3 + y3);

  // 12.37 appears to be the maximum distance this formula returns
  // Maps the distance to a range between the given parameters min and max to be used as the weight
  let md = map(d, 0, 12.37, min, max);

  // Returns the weight rounded to the nearest two decimal places
  // toFixed returns a string
  // The plus in front converts it to a number
  return +md.toFixed(2);
}

// https://www.youtube.com/watch?v=We3YDTzNXEk
// Takes a single target and compares it to a possible match and returns the statistics
function levenshtein({input, target, case_sensitive = false, weighted = false}) {

  // If both parameters are empty return a default object
  if(!input && !target) {
    return create_object();
  }

  // If the target is empty return the length of the string to be compared to
  if(!input) {
    return create_object(target, 0, target.length);
  }

  // If the string to be compared to is empty return the length of the target
  if(!target) {
    return create_object(input, 0, input.length);
  }

  // Will save the original target as a precaution to it being lowercased
  let original_target = target;

  // Lowercase both strings if case insensitive
  if(!case_sensitive) {
    input = input.toLowerCase();
    target = target.toLowerCase();
  }

  let matrix = [];

  // X Axis
  for(i = 0; i <= input.length; i++) {
    matrix[i] = [i];
  }

  // Y Axis
  for(j = 0; j <= target.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= input.length; i++) {
    for(j = 1; j <= target.length; j++) {
      // If the characters are the same, don't change the value
      if(input.charAt(i - 1) == target.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      }
      // Otherwise set it to the minimum of the three values 
      else {
        let weight = weighted ? 1 + add_keyboard_influence(input.charAt(i - 1), target.charAt(j - 1)) : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1],
          matrix[i][j - 1],
          matrix[i - 1][j]
        ) + weight
      }
    }
  }

  // Levenshtein distance
  let distance = matrix[input.length][target.length];
  //let percentage = 100 - (distance / string.length) * 100;
  let percentage = 0;

  // Return an object with the original string, percentage, and distance
  return create_object(original_target, percentage, distance);
}

// Takes a single target and compares it against multiple possible matches and returns the best match
function batch_levenshtein({input, targets, case_sensitive = false, weighted = false, return_amount = 1}) {
  let results = [];
  let percentages = [];
  // For each string to compare
  for(let i = 0; i < targets.length; i++) {
    // Get levenshtein distance
    l = levenshtein({input: input, target: targets[i], case_sensitive: case_sensitive, weighted: weighted});
    // Compile results
    results[i] = create_object(l.string, l.percentage, l.distance);
    // Add percentage to array
    percentages.push(l.percentage);
  }

  // Sorts results based on distance
  results.sort((a, b) => (a.distance > b.distance) ? 1 : -1)

  // If return amount is -1 return all results
  if(return_amount == -1) {
    return results;
  }

  return results.slice(0, return_amount)
}

// Add in character repetition detection

console.log(batch_levenshtein({input: 'test', targets: ['test', 'test1', 'test12'], return_amount: -1}))