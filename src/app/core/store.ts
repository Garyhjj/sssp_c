export class MyStore {
  userReducer: UserState;
}


export interface UserState {
  AVATAR_URL?: string;
  COMPANY_ID?: string;
  DEPTNO?: string;
  DEPT_NAME?: string;
  EMAIL?: string;
  EMPNO?: string;
  ID?: number;
  JOB_TITLE?: string;
  MOBILE?: string;
  NICK_NAME?: string;
  TELEPHONE?: string;
  USER_NAME?: string;
  password?: string;
  modules?: MyModule[];
  rememberPWD?: boolean;
  privilege?: Privilege[];
  token: string;
}

export interface MyModule {
  GROUP_ID: number;
  DISPLAY: 'Y' | 'N';
  GROUP_NAME: string;
  ICON_URL: string;
  MODULE_DESCRIPTION: string;
  MODULE_ID: number | string;
  MODULE_NAME: string;
  TIPS: number;
  children?: MyModule[];
}

export interface Privilege {
  FUNCTION_ID: number;
  FUNCTION_NAME: string;
  FUNCTION_URL: string;
  ROLE_ID: number;
  ROLE_NAME: string;
}
