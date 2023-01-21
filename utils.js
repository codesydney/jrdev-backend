exports.timeElapsed = function () {
  let timeElapsed, text;

  const secInMilliseconds = 1000;
  const minInMilliseconds = 60 * secInMilliseconds;
  const hrInMilliseconds = 60 * minInMilliseconds;
  const dayInMilliseconds = 24 * hrInMilliseconds;

  const timeElapsedInMilliseconds = new Date() - this.createdAt;

  if (timeElapsedInMilliseconds >= dayInMilliseconds) {
    timeElapsed = Math.floor(timeElapsedInMilliseconds / dayInMilliseconds);
    text = timeElapsed === 1 ? 'day ago' : 'days ago';
  } else if (timeElapsedInMilliseconds >= hrInMilliseconds) {
    timeElapsed = Math.floor(timeElapsedInMilliseconds / hrInMilliseconds);
    text = timeElapsed === 1 ? 'hr ago' : 'hrs ago';
    console.log(timeElapsed, text);
  } else if (timeElapsedInMilliseconds >= minInMilliseconds) {
    timeElapsed = Math.floor(timeElapsedInMilliseconds / minInMilliseconds);
    text = timeElapsed === 1 ? 'min ago' : 'mins ago';
  } else {
    timeElapsed = Math.floor(timeElapsedInMilliseconds / secInMilliseconds);
    text = timeElapsed === 1 ? 'sec ago' : 'secs ago';
  }

  return `${timeElapsed} ${text}`;
};
