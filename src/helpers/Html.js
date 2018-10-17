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

const setWindowData = (key, data) =>
  ({ __html: `window.${key} = ${serialize(data)};` });

const Html = args => {

  /*
  * args:
  *   store: object
  *   assets: object
  *   component: node
  */

  const { app, store, assets:
    { Js, publicPath, stylesheets },
  } = args;
  const windowData = setWindowData('__data', store.getState());

  const windowDataScript = (
    <script
      charSet="UTF-8"
      dangerouslySetInnerHTML={windowData} />);

  const htmlContent = (
    <div
      id="root"
      className="root"
      dangerouslySetInnerHTML={{ __html: app }} />);

  const css = stylesheets.map((file, key) =>
    <link rel="stylesheet" href={`${publicPath}/${file}`} key={key} />);

  const html = (
    <html>
      <head>
      <link rel="manifest" href="/manifest.json" />
      {css}
      </head>
      <body>
        {htmlContent}
        {windowDataScript}
        <Js />
      </body>
    </html>);

  return html;
};

export default Html;

