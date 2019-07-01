import { environment } from './../../../../../environments/environment';
const prefix = environment.END_URL;

export default {
  login: prefix +  `global/login`,
};
