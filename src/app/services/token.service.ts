import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor() { }

    getAccessToken() {
        return sessionStorage.getItem("access_token");
    }
    getRefreshToken() {
        return sessionStorage.getItem("refresh_token");
    }
    setAccessToken(tokenKey:string, accessToken:string) {
        sessionStorage.setItem(tokenKey, accessToken);
    }
    setRefreshToken(accessToken:string) {
        sessionStorage.setItem("refresh_token", accessToken);
    }
    removeToken() {
        sessionStorage.clear();
    }

}
