import {OrgModel} from './org-model';

export interface UserModel {
  _id: string;
  authUserId: string;
  // org: {
  //   nom: string;
  //   abr: string;
  //   area: {
  //     nom: string;
  //     abr: string;
  //   }
  // };
  org?: OrgModel;
  entFed: {
    cve: number;
    cveStr: string;
    nom: string;
    abr: string;
    tipo: string;
  };
  authInfo: {
    nom: string;
    appat: string;
    apmat: string;
    mail: string;
    fecnac: string;
    sexo: string;
  };
  roles: Array<RolModel>;
}

export interface RolModel {
  cveStr: string;
  nom: string;
  isActive: boolean;
  paths: Array<string>;
}
