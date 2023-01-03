// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // production: false,
  // logEnabled: true,
  // APIEndpoint: 'http://localhost:4390/api',
  // redirectRoute: '/usercatalog',
  //
  // oa_authLoginUri: 'http://localhost:4310/login-form/v1/',
  // oa_authApiUri: 'http://localhost:4310/api',
  // oa_clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  // oa_encryptSecretKey: '1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==',
  //
  // // adl_ext_income_folder: 'https://baseextorsion01.dfs.core.windows.net/recibir/',
  // adl_ext_income_folder: 'http://localhost:4200/recibir/',

  production: false,
  logEnabled: true,
  APIEndpoint: 'api',
  redirectRoute: '/usercatalog',

  //oa_authLoginUri: 'http://localhost:4320/login-form/v1/',
  oa_authLoginUri: 'http://localhost:4400/feda2-auth/#/login-form/v1/',
  //oa_authApiUri: 'http://localhost:4310/api',
  oa_authApiUri: '/feda2-auth/api',
  oa_clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  oa_encryptSecretKey: '1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==',

  // adl_ext_income_folder: 'https://baseextorsion01.dfs.core.windows.net/recibir/',
  adl_ext_income_folder: 'http://localhost:4200/recibir/',

  useHash: true,
  baseHref: '/feda2-app/'
};
// appSingInURI
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
