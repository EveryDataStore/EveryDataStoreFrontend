import { EnvironmentSettings } from './environment-settings';
import { localEnvironmentSettings } from './environment.local';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environmentDev: EnvironmentSettings = {
  production: false,
  apiUrl: 'http://localhost:8585/restful/',
  debugQueryParams: [{name: 'XDEBUG_SESSION_START', value: 'PHPSTORM'}],
  itemsPerPage: 10,
  demoMode: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export const environment = { ...environmentDev, ...localEnvironmentSettings };
