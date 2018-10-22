export const timer = {
  start: (label = false) => ({ label, time: process.hrtime() }),
  stop: startTime => {
    const diff = process.hrtime(startTime.time);
    const nanosecs = diff[0] * 1e9 + diff[1];
    const secs = nanosecs / 1000000000;
    console.log(`${startTime.label || 'operation'} took: ${secs} secs`);
  },
};
