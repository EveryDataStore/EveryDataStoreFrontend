export interface EnvironmentSettings {
    production: boolean;
    apiUrl: string;
    itemsPerPage?: number;       // default items per page
    debugQueryParams?: any;
    demoMode: boolean;          // can overwrite demo mode settings for testing
    mode?: string;
}
