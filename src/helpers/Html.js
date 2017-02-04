import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  }

  render() {
    const { assets, component, store } = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';
    const windowData = { __html: `window.__data=${serialize(store.getState())};` };
    const htmlContent = { __html: content };

    return (
      <html>
        <head>

          { /* styles (will be present only in production with webpack extract text plugin) */ }
          { Object.keys(assets.styles).map((style, key) =>
            <link
              key={key}
              rel="stylesheet"
              href={assets.styles[style]}
              type="text/css"
              media="screen, projection"
              charSet="UTF-8" />
          )}
        </head>
        <body>
          <div id="content" className="content" dangerouslySetInnerHTML={htmlContent} />
          <script dangerouslySetInnerHTML={windowData} charSet="UTF-8" />
          { // Object.keys(assets.javascript)
            // .sort((k, v) => { if (k < v) { return 1; } return 0; })
            Object.keys(assets.javascript)
            .map((script, key) => {
              if (assets.javascript[script]) {
                return (
                  <script
                    key={key}
                    charSet="UTF-8"
                    src={assets.javascript[script]} />
                );
              }
              return null;
            }
          )}
        </body>
      </html>
    );
  }
}
