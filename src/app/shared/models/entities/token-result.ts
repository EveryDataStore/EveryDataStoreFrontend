import { Settings } from './settings';


export interface TokenResult {
    Token: string;
    Expire: number;
    Settings: Settings,
    Active: number,
    Created: string,
    CurrentDataStoreSlug: string,
    CurrentDataStoreName: string,
    CurrentDataStoreLocale: string,
    Email: string,
    Fullname: string,
    FirstName: string,
    LastEdited: string,
    Slug: string,
    Surname: string,
    avatarURL: string
}
