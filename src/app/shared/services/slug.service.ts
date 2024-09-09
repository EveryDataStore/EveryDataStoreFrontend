import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class SlugService {
    public create(): string {
        let slug = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 50; i++) {
            slug += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return slug;
    }
}
