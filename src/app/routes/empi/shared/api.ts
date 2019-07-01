import { environment } from '@env/environment';

export default {
  updateFiles: environment.EMPI_URL+'files',
  updateRelation: environment.EMPI_URL+'relation',
  sendMails: environment.EMPI_URL + 'files/mails',
  sendRejectMail: environment.EMPI_URL + 'files/mails/reject?fileID={fileID}',
  getOperations: environment.EMPI_URL + 'lookup/operations',
  getLines: environment.EMPI_URL + 'lookup/lines',
  getParts: environment.EMPI_URL + 'lookup/parts',
  getModels: environment.EMPI_URL + 'lookup/models',
  getFamilies: environment.EMPI_URL + 'lookup/families',
  getBoss: environment.EMPI_URL + 'files/set/boss?id={*ID}&company={*COMPANY_ID}'
}