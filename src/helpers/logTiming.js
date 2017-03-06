export const timer = { // eslint-disable-line
  start: (label = false) => ({ label, time: process.hrtime() }),
  stop: (_start) => {
    const diff = process.hrtime(_start.time);
    const nanosecs = (diff[0] * 1e9) + diff[1];
    const secs = nanosecs / 1000000000;
    console.log(`${_start.label || 'operation'} took: ${secs} secs`);
  },
};
