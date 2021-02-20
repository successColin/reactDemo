import { getUrl } from '@/services/login';

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};

export function onRouteChange({ location, routes, action }) {
  console.log(location.pathname, routes, action);
  // getUrl({}).then(res => {
  //   document.title = res.companyName || 'APIoT EAM2.0';
  // });
}
