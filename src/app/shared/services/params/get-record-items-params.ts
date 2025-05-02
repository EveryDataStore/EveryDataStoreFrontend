import {Member} from '../../models/entities/member';

export interface GetRecordItemsParams {
    recordSlug: string;
    page?: number;
    count?: number;
    sortColumn?: string;
    sortOrder?: number;
    searchTerm?: string;
    recordItemSlugs?: string[];
    dateFrom?: string;
    dateTo?: string;
    calendarMember?: Member;
    filters?: Map<string, string>;
}

export const defaultGetRecordItemsParams: GetRecordItemsParams = {
    recordSlug: '',
    page: 0,
    count: 100,
    sortColumn: '',
    sortOrder: 1,
    searchTerm: null,
    recordItemSlugs: [],
    dateFrom: null,
    dateTo: null,
    calendarMember: null,
    filters: null,
};
