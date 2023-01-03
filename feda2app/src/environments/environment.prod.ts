export const environment = {
  // AMBIENTE DE DESARROLLO -------------------------------------------------------------->
  // production: true,
  // logEnabled: true,
  // APIEndpoint: 'https://ext-dev.azurewebsites.net/api',
  // redirectRoute: '/usercatalog',
  //
  // oa_authLoginUri: 'https://authsrv-dev.azurewebsites.net/login-form/v1/',
  // oa_authApiUri: 'https://authsrv-dev.azurewebsites.net/api',
  // oa_clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  // oa_encryptSecretKey: '1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==',
  //
  // adl_ext_income_folder: 'https://baseextorsion01.dfs.core.windows.net/recibir/',
  // adl_ext_income_folder: 'http://localhost:4200/recibir/',


  production: true,
  logEnabled: false,
  APIEndpoint: 'api',
  redirectRoute: '/usercatalog',

  // CONFIGURACIONES PARA AMBIENTE CNI05 (DEV)
  oa_authLoginUri: '/feda2-auth/#/login-form/v1/',
  oa_authApiUri: '/feda2-auth/api',
  oa_clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  oa_encryptSecretKey: '1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==',

  // oa_authLoginUri: 'https://auth.sesnsp-cni.app/login-form/v1/',
  // oa_authApiUri: 'https://auth.sesnsp-cni.app/api',
  // oa_clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  // oa_encryptSecretKey: '1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==',

  adl_ext_income_folder: 'https://baseextorsion01.dfs.core.windows.net/recibirproduccion/',

  useHash: true,
  baseHref: '/feda2-app/'
};
