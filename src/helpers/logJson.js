const logJSON = (msg, consoleType = 'log') => console[consoleType](JSON.stringify(msg, 0, 2));
export default logJSON;
