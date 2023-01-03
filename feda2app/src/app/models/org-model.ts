export interface OrgModel {
  _id?: string;

  cveStr?: string;
  nom?: string;
  abr?: string;
  anc?: Array<string>;
  area?: {
    cveStr?: string;
    nom?: string;
    abr?: string;
  };
  eval?: boolean;
}
