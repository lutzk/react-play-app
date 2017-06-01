import ApiClient from '../../utils/ApiClient';
import { slLogoutPath } from '../../config';

export default function logout(req) {

  const client = new ApiClient(req);
  const headers = { Authorization: `Bearer ${req.session.user.token}:${req.session.user.password}` };

  return client
    .post(slLogoutPath, { headers })
    .then((r) => {
      if (r.ok && r.success) {
        req.session.user = null;
        req.session.token = null;

        return new Promise((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) {
              reject();
            }

            return resolve({ result: 'logged out' });
          });
        });
      }
      return false;
      // return Promise.resolve(req.session.user);
    }).catch(e => console.error('LogoutError', e));
}
