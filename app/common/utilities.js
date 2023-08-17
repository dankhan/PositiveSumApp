// Common imports
import axios from 'axios';

// Set an authorisation header in XML-http requests
function setAuthorizationHeader(accessToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 *
 * @param date  Date to start with
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 * @param units  Number of units of the given interval to add.
 */
function dateAdd(date, interval, units) {
  let ret = new Date(date); // don't change original date
  const checkRollover = () => { if (ret.getDate() !== date.getDate()) ret.setDate(0); };
  switch (interval.toLowerCase()) {
    case 'year': ret.setFullYear(ret.getFullYear() + units); checkRollover(); break;
    case 'quarter': ret.setMonth(ret.getMonth() + (3 * units)); checkRollover(); break;
    case 'month': ret.setMonth(ret.getMonth() + units); checkRollover(); break;
    case 'week': ret.setDate(ret.getDate() + (7 * units)); break;
    case 'day': ret.setDate(ret.getDate() + units); break;
    case 'hour': ret.setTime(ret.getTime() + (units * 3600000)); break;
    case 'minute': ret.setTime(ret.getTime() + (units * 60000)); break;
    case 'second': ret.setTime(ret.getTime() + (units * 1000)); break;
    default: ret = undefined; break;
  }
  return ret;
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  if (!hours) hours = 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  const strTime = `${hours}:${minutes}${ampm}`;
  return strTime;
}

function getOrdinalNum(n) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

function monthName(m, useShort=false) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mn = monthNames[m];
  return useShort ? mn.substring(0,3) : mn;
}

function daysAgoLabel(timestamp, isTimestamp = true, isDateOnly = false, showTime = true, displayTitleCase = true) {
  if (!timestamp) return '';

  // If date only, then we set current time to current day at midnight so calculations are correct
  let today = new Date();
  if (isDateOnly) {
    today.setHours(0, 0, 0, 0);
  }
  today = today.getTime() / 1000;

  // Convert to timestamp
  let ago = timestamp;
  let parts = null;
  if (!isTimestamp) {
    if (isDateOnly) {
      parts = timestamp.match(/(\d{4})-(\d{2})-(\d{2})/);
      ago = new Date(+parts[1], +parts[2] - 1, +parts[3], 0, 0, 0).getTime() / 1000;
    } else {
      parts = timestamp.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      ago = new Date(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5], +parts[6])
        .getTime() / 1000;
    }
  }
  let secondsDiff = today - ago;
  const daysAgo = secondsDiff / 60 / 60 / 24;
  const weeksAgo = daysAgo / 7;
  const monthsAgo = daysAgo / 30;
  let daysTogo = -1;
  let weeksTogo = -1;
  let monthsTogo = -1;

  // Forward dates
  if (secondsDiff < 0) {
    secondsDiff = ago - today;
    daysTogo = secondsDiff / 60 / 60 / 24;
    weeksTogo = daysTogo / 7;
    monthsTogo = daysTogo / 30;
  }

  // Forward dates first
  const dStr = formatAMPM(new Date(ago * 1000));
  if (today - ago < 0) {
    const now = today;
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    tomorrow = tomorrow.getTime() / 1000;
    const secsTilMidnight = tomorrow - now;

    if (secondsDiff < secsTilMidnight) {
      return `${(displayTitleCase ? 'T' : 't')}oday${(!isDateOnly && showTime ? ` at ${dStr}` : '')}`;
    } else if (daysTogo < 2) {
      return `${(displayTitleCase ? 'T' : 't')}omorrow${(!isDateOnly && showTime ? `at ${dStr}` : '')}`;
    } else if (Math.floor(weeksTogo) > 4 && Math.floor(weeksTogo) < 8) {
      return `${(displayTitleCase ? 'I' : 'i')}n ${Math.floor(weeksTogo)} weeks`;
    } else if (Math.floor(weeksTogo) === 4) {
      return `${(displayTitleCase ? 'I' : 'i')}n 1 month`;
    } else if (monthsTogo > 12) {
      return `${(displayTitleCase ? 'I' : 'i')}n ${Math.floor(monthsTogo / 12)}+ year${Math.floor(monthsTogo) / 12 > 1 ? 's' : ''}`;
    } else if (monthsTogo > 1) {
      return `${(displayTitleCase ? 'I' : 'i')}n ~ ${Math.ceil(monthsTogo)} months`;
    } else if (Math.floor(daysTogo) === 7) {
      return `${(displayTitleCase ? 'I' : 'i')}n 1 week`;
    } else if (Math.floor(daysTogo) % 7 === 0) {
      return `${(displayTitleCase ? 'I' : 'i')}n ${Math.floor(daysTogo) / 7} week${Math.floor(daysTogo) / 7 > 1 ? 's' : ''}`;
    }
    return `${(displayTitleCase ? 'I' : 'i')}n ${Math.floor(daysTogo)} days`;
  }

  if (daysAgo < 1) {
    return `${(displayTitleCase ? 'T' : 't')}oday${(!isDateOnly && showTime ? ` at ${dStr}` : '')}`;
  } else if (daysAgo < 2) {
    return `${(displayTitleCase ? 'Y' : 'y')}esterday${(!isDateOnly && showTime ? ` at ${dStr}` : '')}`;
  } else if (monthsAgo > 12) {
    return `${Math.floor(monthsAgo / 12)}+ years ago`;
  } else if (monthsAgo > 1) {
    return `${Math.ceil(monthsAgo)} months ago`;
  } else if (Math.ceil(weeksAgo) === 4) {
    return '1 month ago';
  } else if (weeksAgo > 1) {
    return `${Math.ceil(weeksAgo)} weeks ago`;
  } else if (daysAgo >= 6 && daysAgo <= 7) {
    return '1 week ago';
  }
  return `${Math.ceil(daysAgo)} days ago`;
}

function daysAgoClass(timestamp, isTimestamp = true, isDateOnly = false) {
  const dStr = daysAgoLabel(timestamp, isTimestamp, isDateOnly);
  if (!dStr) return 'notdue';
  if (dStr.substr(-3) === 'ago' || dStr === 'yesterday') {
    return 'overdue';
  } else if (dStr.substring(0, 5) === 'today' || dStr.substring(0, 8) === 'tomorrow' ||
    dStr === 'in 1 week') {
    return 'due';
  }
  const matches = dStr.match(/in (\d+) (day|week)[s]+/i);
  if (matches && matches[1] && ((matches[2] === 'day' && Number(matches[1]) <= 7))) return 'due';
  if (matches && matches[1] && ((matches[2] === 'day' && Number(matches[1]) <= 14) || ((matches[2] === 'week' && matches[1] === '1') || (matches[1] === '2')))) return 'soon';
  return 'notdue';
}

function daysAgoColor(timestamp, isTimestamp = true, isDateOnly = false) {
  const dStr = daysAgoLabel(timestamp, isTimestamp, isDateOnly);
  if (!dStr) return 'blue-grey';
  if (dStr.substr(-3) === 'ago' || dStr === 'yesterday') {
    return 'red darken-4';
  } else if (dStr.substring(0, 5) === 'today' || dStr.substring(0, 8) === 'tomorrow' ||
    dStr === 'in 1 week') {
    return 'red';
  }
  const matches = dStr.match(/in (\d+) (day|week)[s]+/i);
  if (matches && matches[1] && ((matches[2] === 'day' && Number(matches[1]) <= 7))) return 'red';
  if (matches && matches[1] && ((matches[2] === 'day' && Number(matches[1]) <= 14) || ((matches[2] === 'week' && matches[1] === '1') || (matches[1] === '2')))) return 'orange';
  return 'blue-grey';
}

function countDecimals(value) {
  if (Math.floor(value) === value || value.toString().split('.').length <= 1) return 0;
  return value.toString().split('.')[1].length || 0;
}

function trimTo2Decimal(num) {
  return (num > 0) ? Math.floor(num * 100) / 100 : Math.ceil(num * 100) / 100;
}

function IsValidDate(dateString) {
  // Empty date okay
  if (!dateString) return true;

  // First check for the pattern
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) return false;

  // Parse the date parts to integers
  const parts = dateString.split('-');
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

function toTitleCase(str) {
  return str.replace(
    /\b\w+('\w{1})?/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    }
  );
}

function formatAudioDuration(durationSecs) {
  if (durationSecs > (10 * 60 * 60)) {
    return new Date(durationSecs * 1000).toISOString().substr(11, 8);
  } else if (durationSecs > (60 * 60)) {
    return (new Date(durationSecs * 1000).toISOString().substr(12, 7));
  } else if (!isNaN(durationSecs)) {
    return new Date(durationSecs * 1000).toISOString().substr(14, 5);
  } else {
    return '';
  }
}

// @see https://gist.github.com/NathanWalker/ae01b826e4122f16d4aa3f08b53bd772;
let iPhoneVersion;
function getIPhoneVersion(isIOS) {
  if (isIOS) {
    if (typeof iPhoneVersion === 'undefined') {
      const _SYS_NAMELEN = 256;

      const buffer = interop.alloc(5 * _SYS_NAMELEN);
      uname(buffer);
      let name = NSString.stringWithUTF8String(buffer.add(_SYS_NAMELEN * 4)).toString();

      // Get machine name for Simulator
      if (name === 'x86_64' || name === 'i386') {
        name = NSProcessInfo.processInfo.environment.objectForKey('SIMULATOR_MODEL_IDENTIFIER');
      }

      return name;
    }
    return iPhoneVersion;
  }
  return false;
}

function isIPhoneX(isIOS) {
  const version = getIPhoneVersion(isIOS);
  return version.indexOf('iPhone10,3') === 0 || version.indexOf('iPhone10,6') === 0;
}

function isIPhone12mini(isIOS) {
  const version = getIPhoneVersion(isIOS);
  return version.indexOf('iPhone13,1') === 0;
}

function getRandomWithExclude(min, max, excluded = []) {
  let num = Math.floor(Math.random() * (max - min + 1 - excluded.length) + min);
  excluded
    .sort((a, b) => a - b)
    .every((exclusion) => exclusion <= num && (num++, true));
  return num;
};

function formatRecordedTime(time) {
  if (time > (10 * 60 * 60)) {
    return new Date(time * 1000).toISOString().substr(11, 8);
  } else if (time > (60 * 60)) {
    return (new Date(time * 1000).toISOString().substr(12, 7));
  } else {
    return new Date(time * 1000).toISOString().substr(14, 5);
  }
}

// Helper function to get combinations of array items
function getCombinations(valuesArray) {
  var combi = [];
  var temp = [];
  var slent = Math.pow(2, valuesArray.length);

  for (var i = 0; i < slent; i++) {
      temp = [];
      for (var j = 0; j < valuesArray.length; j++) {
          if ((i & Math.pow(2, j))) {
              temp.push(valuesArray[j]);
          }
      }
  
      if (temp.length > 0) {
          combi.push(temp);
      }
  }

  combi.sort((a, b) => a.length - b.length);
  return combi;
}

// Deep copy of an array of objects
function deepCopy (arr) {
  var out = [];
  for (var i = 0, len = arr.length; i < len; i++) {
      var item = arr[i];
      var obj = {};
      for (var k in item) {
          obj[k] = item[k];
      }
      out.push(obj);
  }
  return out;
}

// CHeck if objecst have same property names and values
function objectsAreSame(x, y) {
  var objectsAreSame = true;
  for(var propertyName in x) {
     if(x[propertyName] !== y[propertyName]) {
        objectsAreSame = false;
        break;
     }
  }
  return objectsAreSame;
}

// @see https://github.com/moroshko/shallow-equal
function shallowEqualArrays(arrA, arrB) {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  var len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Create date time stamp similar to Java Date()
 */
 function createDateTimeStamp() {
  let result = '';
  const date = new Date();
  result =
    date.getFullYear().toString() +
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1).toString()
      : (date.getMonth() + 1).toString()) +
    (date.getDate() < 10
      ? '0' + date.getDate().toString()
      : date.getDate().toString()) +
    '_' +
    (parseInt(date.getHours(),10) < 10
        ? '0' + date.getHours().toString()
        : date.getHours().toString()) +
    (parseInt(date.getMinutes(),10) < 10
        ? '0' + date.getMinutes().toString()
        : date.getMinutes().toString()) +
    (parseInt(date.getSeconds(),10) < 10
        ? '0' + date.getSeconds().toString()
        : date.getSeconds().toString());
  return result;
};

export { setAuthorizationHeader, dateAdd, formatAMPM, daysAgoLabel, daysAgoClass, daysAgoColor, countDecimals, trimTo2Decimal, IsValidDate, toTitleCase, formatAudioDuration, isIPhoneX, isIPhone12mini, getIPhoneVersion, monthName, getOrdinalNum, getRandomWithExclude, formatRecordedTime, getCombinations, deepCopy, objectsAreSame, shallowEqualArrays, createDateTimeStamp };
