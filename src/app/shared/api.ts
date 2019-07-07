import { environment } from './../../environments/environment';
const prefix = environment.END_URL;
export default {
    getAgentUrl: prefix + 'lookup/GetUserLikeNoSite?emp_name={emp_name}',
  
    getSelfPrivilege: prefix + 'Guid/GetUserFunctions?moduleID={moduleID}',

    uploadPicture: prefix + 'IPQA/UploadPicture',
};
