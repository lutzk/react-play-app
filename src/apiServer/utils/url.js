export default function mapUrlToActions(availableActions = {}, paths = []) {
  // console.log('availableActions', availableActions);
  const notFound = { action: null, params: [] };

  // test for empty input
  if (paths.length === 0 || Object.keys(availableActions).length === 0) {
    console.log(
      'availableActions nonono',
      Object.keys(availableActions),
      Object.keys(availableActions).length,
    );
    return notFound;
  }

  /*eslint-disable */
  const reducer = (prev, current) => {
    if (prev.action && prev.action[current]) {
      return { action: prev.action[current], params: [] }; // go deeper
    } else {
      if (typeof prev.action === 'function') {
        return { action: prev.action, params: prev.params.concat(current) }; // params are found
      } else {
        return notFound;
      }
    }
  };
  /*eslint-enable */

  const actionAndParams = paths.reduce(reducer, {
    action: availableActions,
    params: [],
  });
  console.log(
    '__REDUCER__4',
    typeof actionAndParams.action === 'function' ? actionAndParams : notFound,
  );
  return typeof actionAndParams.action === 'function'
    ? actionAndParams
    : notFound;
}
