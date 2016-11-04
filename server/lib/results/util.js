export function sanitiseInteger(value, message, blankCellIsZero = false) {
  let _value;
  const type = typeof value;

  if (type === 'string') {
    _value = value.trim();
    if (_value === '') {
      _value = blankCellIsZero ? 0 : null;
    } else {
      _value = Number.parseInt(_value);
      if (Number.isNaN(_value)) {
        throw new Error(`${message}: "${value}" is a string that cannot be parsed as an Integer`);
      }
    }
  } else if (type === 'number') {
    if (Number.isInteger(value)) {
      _value = value;
    } else {
      throw new Error(`${message}: ${value} is not an Integer`);
    }
  } else if (value === null) {
    _value = blankCellIsZero ? 0 : null;
  } else {
    throw new Error(`${message}: cannot use value ${value} of type ${type}`);
  }

  return _value;
}

export function percent(a, b) {
  return a / b * 100;
}

// Total number of States, congressional districts and DC
export const maxPolities = 56;

// Sum of the all the State's electoral votes
export const maxVotes = 538;

export function percentOfVotes(votes) {
  return 100 / maxVotes * votes;
}
