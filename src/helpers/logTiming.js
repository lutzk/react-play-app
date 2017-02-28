export const timer = { // eslint-disable-line
  start: () => process.hrtime(),
  stop: (_start, label = false) => {
    const diff = process.hrtime(_start);
    const nanosecs = (diff[0] * 1e9) + diff[1];
    const secs = nanosecs / 1000000000;
    console.log(`${label || 'operation'} took: ${secs} secs`);
  },
};
