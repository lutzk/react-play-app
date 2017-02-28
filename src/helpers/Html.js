import React from 'react';
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

const Html = (_props) => {

  /*
  * _props:
  *   store: object
  *   assets: object
  *   component: node
  */

  const { assets, component, store } = _props;
  const content = component ? ReactDOM.renderToString(component) : '';
  const windowData = { __html: `window.__data=${serialize(store.getState())};` };

  const windowDataScript = (
    <script
      charSet="UTF-8"
      dangerouslySetInnerHTML={windowData} />);

  const htmlContent = (
    <div
      id="content"
      className="content"
      dangerouslySetInnerHTML={{ __html: content }} />);

  const css = assets.css ? Object.keys(assets.css).map((styles, key) => {
    let scriptTags = null;
    if (assets.css[styles]) {
      scriptTags = assets.css[styles].map((style, i) => (
        <link
          key={key + i}
          rel="stylesheet"
          href={style}
          type="text/css"
          media="screen, projection"
          charSet="UTF-8" />));
    }

    return scriptTags;
  }) : null;

  const js = assets.js ? Object.keys(assets.js).map((scripts, key) => {
    let scriptTags = null;
    if (assets.js[scripts]) {
      scriptTags = assets.js[scripts].map((script, i) => (
        <script
          key={i + key}
          charSet="UTF-8"
          src={script} />));
    }

    return scriptTags;
  }) : null;

  const html = (
    <html>
      <head>
        {css}
      </head>
      <body>
        {htmlContent}
        {windowDataScript}
        {js}
      </body>
    </html>);

  return html;
};

export default Html;

