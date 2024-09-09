export interface MenuItem {
    label: string;
    controller: string;
    icon: string;
    routerLink: string[];
    badgeResult?: string;
    badgeEndpoint?: string;
    url?: string;
    avatar?: string;
    items?: MenuItem[];
    target?: string;
    disabled?: boolean;
    command?: any;
}
