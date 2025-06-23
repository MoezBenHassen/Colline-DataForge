import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    templateUrl: 'login-component.html',
    styleUrls: ['login-component.scss'],
})
export class Login {
    email = '';
    password = '';
    checked = false;
    error: string | null = null;

    constructor(private authService: AuthService, private router: Router) {}

    onSubmit() {
        console.log('Login submitted', this.email, this.password);
        this.authService.login(this.email, this.password).subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => {
                this.error = "Invalid credentials"; // optionally get from err.error.message
            }
        });
    }
}
