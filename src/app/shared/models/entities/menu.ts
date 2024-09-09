import { MenuItem } from '../ressources/menu-item';
import { DataStore } from './datastore';

export enum MenuType {
    MainMenu, AdminMenu, UserMenu
}

export class Menu {
    ID: number;
    Slug: string;
    DataStoreID: number;
    Title: string;
    Controller: string;
    Action: string;
    ActionID: string;
    Sort: number;
    Parent: any;
    ParentID: string;
    Children: any;
    Icon: string;
    DataStore: DataStore;
    Badge: {
        Result: string;
        Endpoint: string;
    }

    static menuArrayToMenuItems(menus: Menu[], preRoute = ''): any[] {
        const menuItems = [];
        menus.forEach(menu => {
            const icon = (menu.Icon.trim() !== '') ? menu.Icon.trim() : 'fas fa-database';
            const routerLink = '/' + ((preRoute !== '') ? preRoute + '/' : '') + menu.Controller + '/' + menu.Action + '/' + menu.ActionID;
            const badgeResult = (menu.Badge) ? menu.Badge.Result : '';
            const badgeEndpoint = (menu.Badge) ? menu.Badge.Endpoint : '';

            const menuItem: MenuItem = {
                label: menu.Title,
                controller: menu.Controller,
                icon,
                routerLink: [routerLink],
                badgeResult,
                badgeEndpoint
            };
            if (menu.Children !== undefined && menu.Children.length > 0) {
                menuItem['items'] =  Menu.menuArrayToMenuItems(menu.Children, preRoute);
            }
            menuItems.push(menuItem);
        });
        return menuItems;
    }
}
