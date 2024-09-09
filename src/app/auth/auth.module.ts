import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNGModule } from './../primeng.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPageComponent } from './login-page/login-page.component';
import { RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
    declarations: [LoginPageComponent, ForgotPasswordComponent, RecoverPasswordComponent],
    imports: [
        CommonModule, PrimeNGModule, RouterModule, FormsModule, ReactiveFormsModule, TranslateModule
    ],
    exports: [
        LoginPageComponent,
        ForgotPasswordComponent
    ]
})
export class AuthModule { }
