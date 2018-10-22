/*

  adapted from:
    https://github.com/apollographql/react-apollo/blob/master/src/server.ts

    modified to collect and wait for promises returned from instance.fetchData method if present

*/

import { Children } from 'react';
import { renderToString } from 'react-dom/server';

let dispatch;
const FETCH = 'fetchData';
// let getState;
// Recurse a React Element tree, running visitor on each element.
// If visitor returns `false`, don't call the element's render function
//   or recurse into its child elements
function walkTree(element, context, visitor) {
  const Component = element.type;
  // a stateless functional component or a class
  if (typeof Component === 'function') {
    const props = { ...Component.defaultProps, ...element.props };
    let childContext = context;
    let child;

    // Are we are a react class?
    //   https://github.com/facebook/react/blob/master/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js#L66
    if (Component.prototype && Component.prototype.isReactComponent) {
      const instance = new Component(props, context);
      // In case the user doesn't pass these to super in the constructor
      instance.props = instance.props || props;
      instance.context = instance.context || context;

      // Override setState to just change the state, not queue up an update.
      //   (we can't do the default React thing as we aren't mounted "properly"
      //   however, we don't need to re-render as well only support setState in
      //   componentWillMount, which happens *before* render).
      instance.setState = newState => {
        instance.state = { ...instance.state, ...newState };
      };

      // this is a poor man's version of
      //   https://github.com/facebook/react/blob/master/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js#L181
      if (instance.componentWillMount) {
        instance.componentWillMount();
      }

      if (instance.getChildContext) {
        childContext = { ...context, ...instance.getChildContext() };
      }

      if (visitor(element, instance, context) === false) {
        return;
      }

      child = instance.render();
    } else {
      // just a stateless functional
      if (visitor(element, null, context) === false) {
        return;
      }

      // typescript casting for stateless component
      // const _component = Component as StatelessComponent<any>;
      child = Component(props, context);
    }

    if (child) {
      walkTree(child, childContext, visitor);
    }
  } else {
    // a basic string or dom element, just get children
    if (visitor(element, null, context) === false) {
      return;
    }

    if (element.props && element.props.children) {
      Children.forEach(element.props.children, child => {
        if (child) {
          walkTree(child, context, visitor);
        }
      });
    }
  }
}

function getPromisesFromTree(
  { rootElement, rootContext = {} },
  fetchRoot = true,
) {
  const promises = [];
  walkTree(rootElement, rootContext, (element, instance, context) => {
    // eslint-disable-line
    const skipRoot = !fetchRoot && element === rootElement;
    if (instance && typeof instance[FETCH] === 'function' && !skipRoot) {
      const promise = instance[FETCH]();
      if (promise) {
        promises.push({ promise, element, context });
        // Tell walkTree to not recurse inside this component;  we will
        // wait for the promise to execute before attempting it.
        return false;
      }
    }
  });

  return promises;
}

// XXX component Cache
function getDataFromTree(rootElement, rootContext = {}, fetchRoot = true) {
  const promises = getPromisesFromTree({ rootElement, rootContext }, fetchRoot);

  // no promises found, nothing to do
  if (!promises.length) {
    return Promise.resolve();
  }
  const errors = [];
  // wait on each query that we found, re-rendering the subtree when it's done
  const mappedPromises = promises.map(async ({ promise, element, context }) => {
    //   // we've just grabbed the promise for element, so don't try and get it again
    let action;
    let result;
    try {
      action = await promise; // could be an array
      if (Array.isArray(action)) {
        const actions = action.map(a => dispatch(a()));
        result = await Promise.all(actions);
      } else {
        result = await dispatch(action());
      }

      getDataFromTree(element, context, false);
    } catch (e) {
      errors.push(e);
    }
    return result;
  });

  // Run all queries. If there are errors, still wait for all queries to execute
  // so the caller can ignore them if they wish. See https://github.com/apollographql/react-apollo/pull/488#issuecomment-284415525
  return Promise.all(mappedPromises).then(_ => {
    if (errors.length > 0) {
      const error =
        errors.length === 1
          ? errors[0]
          : new Error(
              `${
                errors.length
              } errors were thrown when executing your GraphQL queries.`,
            );
      error.promiseErrors = errors;
      throw error;
    }
  });
}

async function renderToStringWithData(component, store) {
  dispatch = store.dispatch;
  // getState = store.getState;
  await getDataFromTree(component); // .then(() =>
  return renderToString(component);
}

export { renderToStringWithData };
