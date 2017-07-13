import React from 'react';
// import { renderToString } from 'react-dom/server';
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

const Html = (_props) => {

  /*
  * _props:
  *   store: object
  *   assets: object
  *   component: node
  */

  const { /* assets , */ component, store, extra } = _props;
  const appRoot = component; // ? renderToString(component) : '';
  const windowData = { __html: `window.__data=${serialize(store.getState())};` };
  const windowCss = { __html: `window.__CSS_CHUNKS__=${serialize(extra.cssHashRaw)};` };

  const windowDataScript = (
    <script
      charSet="UTF-8"
      dangerouslySetInnerHTML={windowData} />);

  const windowCSSHash = (
    <script
      charSet="UTF-8"
      dangerouslySetInnerHTML={windowCss} />);

  const htmlContent = (
    <div
      id="root"
      className="root"
      dangerouslySetInnerHTML={{ __html: appRoot }} />);

  const Js = extra.Js;
  const Styles = extra.Styles;
  const html = (
    <html>
      <head>
      <Styles />
      <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {htmlContent}
        {windowDataScript}
        <Js />
        {windowCSSHash}
      </body>
    </html>);

  return html;
};

export default Html;

