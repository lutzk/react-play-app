const getWorker = () =>
  navigator.serviceWorker.ready.then(w => w.active);

const getSWorkerRegistration = () =>
  navigator.serviceWorker.ready.then(r => r);

// const addMsgHandler = () =>
//   navigator.serviceWorker.onmessage = event => event.data;
    // event.ports[0].postMessage(['msg ack from window', event.data.data]);
    // console.log('___GOT MSG FROM WORKER__', event);

const sendMsg = ({ msg, reciever }) =>
  new Promise((resolve, reject) => {
    const msgChannel = new MessageChannel();
    msgChannel.port1.onmessage = (e) => {
      if (e.data.error) {
        reject(e.data.error);
      } else {
        resolve(e.data);
      }
    };
    if (!reciever) {
      throw new Error('`sendMsg` called without reciever, dont know where to send msg');
    } else {
      // console.log('POST TO WORKERA__', msg);
      reciever.postMessage(msg, [msgChannel.port2]);
    }
  })
  .catch(e => console.error(e));

const currySendMsg = reciever => msg => sendMsg({ msg, reciever });

// const sendMsgToWorker = ({ msg, worker }) =>
//   new Promise((resolve, reject) => {
//     const msgChannel = new MessageChannel();
//     msgChannel.port1.onmessage = (e) => {
//       if (e.data.error) {
//         reject(e.data.error);
//       } else {
//         resolve(e.data);
//       }
//     };
//     if (!worker) {
//       getWorker().then(w => w.postMessage(msg, [msgChannel.port2]));
//     } else {
//       console.log('POST TO WORKERA__', msg);
//       worker.postMessage(msg, [msgChannel.port2]);
//     }
//   });


// const sendMsgToSharedWorker = ({ msg, worker }) =>
//   new Promise((resolve, reject) => {
//     // const msgChannel = new MessageChannel();
//     worker.port.onmessage = (e) => {
//       console.log('__e from shared worker__', e);
//       if (e.data.error) {
//         reject(e.data.error);
//       } else {
//         resolve(e.data);
//       }
//     };
//     if (!worker) {
//       // getWorker().then(w => w.postMessage(msg, [msgChannel.port2]));
//     } else {
//       console.log('__POST MSG TO WORKER__', msg);
//       worker.port.postMessage(msg);
//     }
//   });

// const sendMsgToSharedWorker = ({ msg, worker }) => {
//   console.log('__POST NSG TO WORKER__', msg);
//   worker.port.postMessage(msg);
// };
// const openPortToSharedWorker = ({ worker, handler }) => {
//   // worker.port.start();
//   worker.port.onmessage = (e) => {
//     console.log('__e from shared worker__', e);
//     handler(e);
//   };
// };

const cachePageOnEnter = (nextState, replace, cb) => {
  const { pathname } = nextState.location;
  if (typeof window !== 'undefined') {
    const msg = { data: pathname };
    return getWorker()
      .then(worker =>
        sendMsg({ msg, worker }))
      .then(() => cb())
      .catch((e) => {
        console.log('SMTOWE:', e);
        return cb();
      });
  }
  return cb();
};

const hasWindow = () => typeof window !== 'undefined';
// let serviceWorkerRegistration;
const serviceWorkersEnabled = () => 'serviceWorker' in navigator;
const registerCacheWorker = worker =>
  navigator.serviceWorker.register(worker)
    .then(s =>
      // addMsgHandler();
       s)
    .catch(e => console.log('____SWE:', e));

const initCacheWorker = (worker) => {
  if (serviceWorkersEnabled() /* && !serviceWorkerRegistration */) {
    return registerCacheWorker(worker);
  }
  return Promise.resolve(true);
};

const workersEnabled = () => 'Worker' in window;
const initWorker = (worker, name) => {
  if (hasWindow() && workersEnabled()) {
    const w = new Worker(worker, name);
    return Promise.resolve(w);
  }
  return Promise.resolve(false);
};

const getInlineWorker = (worker) => {
  const src = `(${worker})();`;
  const blob = new Blob([src], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

const initWorkerSync = (worker, name) => {
  if (hasWindow() && workersEnabled()) {
    const w = new Worker(worker, { name });
    return w;
  }
  return false;
};

const notify = (msg) => {
  Notification.requestPermission((result) => {
    if (result === 'granted') {
      getSWorkerRegistration().then(registration => registration.showNotification('its a notification', {
        body: msg,
        vibrate: [200, 100, 200, 100],
        tag: 'noti sample',
      }));
    }
  });
};


export {
  notify,
  getWorker,
  hasWindow,
  initWorker,
  currySendMsg,
  initWorkerSync,
  getInlineWorker,
  initCacheWorker,
  cachePageOnEnter,
};
