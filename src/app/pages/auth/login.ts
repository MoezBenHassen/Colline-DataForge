import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 346 342"
                                 class="mb-8 w-16 shrink-0 mx-auto">
                                <defs>
                                    <style>.cls-1{fill:var(--primary-color);}</style>
                                </defs>
                                <!--
                                  By setting the viewBox to the icon's original dimensions and removing the transform,
                                  the browser will correctly scale the entire icon to fit the w-16 class without cropping.
                                -->
                                <path class="cls-1"
                                      d="M183.64,136.9c-2.23,0-7.86-4.87-10.9-7.78-3.78-3.62-7.56-7.22-11.33-10.84-3-2.91-3.07-4.81-.13-7.85,1.48-1.53,3.1-2.93,4.57-4.47s1.5-2.73-.07-4.28q-5.13-5.07-10.39-10c-1.76-1.66-3.06-1.58-5,.32-3.86,3.82-7.65,7.72-11.49,11.56L99.48,142.87c-2.37,2.35-2.39,3.35,0,5.6q4.6,4.44,9.26,8.82c2,1.91,3.27,1.92,5.31,0,2.24-2.14,4.41-4.34,6.6-6.53s3.74-2.23,5.78,0c3.21,3.48,6.69,6.8,9.42,10.63a24.18,24.18,0,0,1-2,30.64c-6.57,7.29-13.81,14-20.67,21-2.55,2.61-4.84,5.45-7.29,8.24-4.76-4.28-8.79-7.91-12.84-11.53-16.66-14.89-34.91-27.34-55.58-36.06A139.11,139.11,0,0,0,.94,164a8,8,0,0,1-.81-.19v-4.71C5.65,158.06,11,157.2,16.27,156c20.59-4.73,39.43-13.54,57-25.14,23.89-15.8,45.29-34.43,63.13-56.94,10.32-13,19.45-26.79,25.41-42.44A94.74,94.74,0,0,0,168.19.38h5.11c.55,4.57.9,9.09,1.67,13.53,2.32,13.5,7.72,25.84,14.6,37.59,7.75,13.25,17.47,25,27.92,36.15,2.63,2.8,5.28,5.6,8.1,8.59-1.73,1.69-3.5,3.38-5.23,5.1Q208,113.66,195.71,126c-.58.58-1.19,1.14-1.79,1.7" />
                                <path class="cls-1"
                                      d="M209.07,157.59c0,2.24,5,7.76,8,10.75l11.07,11.1c3,3,4.87,3,7.85,0,1.5-1.51,2.87-3.16,4.38-4.66s2.69-1.55,4.27,0q5.18,5,10.24,10.19c1.69,1.72,1.64,3-.23,5-3.74,3.94-7.55,7.81-11.31,11.73q-19.28,20.1-38.53,40.22c-2.3,2.41-3.3,2.45-5.6.16q-4.53-4.52-9-9.08c-1.95-2-2-3.23-.07-5.31,2.09-2.28,4.25-4.49,6.39-6.72s2.16-3.79-.09-5.78c-3.54-3.15-6.93-6.56-10.83-9.21A24.18,24.18,0,0,0,155,208.51c-7.16,6.72-13.7,14.1-20.6,21.1-2.56,2.59-5.36,4.95-8.09,7.45,4.37,4.68,8.09,8.63,11.78,12.6,15.23,16.36,28,34.35,37.18,54.84a138.69,138.69,0,0,1,10.38,36.31,8.23,8.23,0,0,0,.21.81l2.38-.05,2.32-.05c.95-5.55,1.7-10.91,2.8-16.2,4.31-20.69,12.74-39.7,24-57.47,15.31-24.21,33.5-46,55.65-64.28,12.8-10.58,26.39-20,41.92-26.26a94.75,94.75,0,0,1,30.94-7l-.1-5.11c-4.58-.46-9.1-.72-13.56-1.39-13.54-2.05-26-7.2-37.88-13.84-13.4-7.48-25.33-17-36.7-27.18-2.86-2.57-5.71-5.16-8.76-7.92-1.65,1.76-3.3,3.56-5,5.32q-12.07,12.58-24.14,25.16c-.58.59-1.12,1.21-1.67,1.82" />
                            </svg>
                            <svg width="142" height="31" viewBox="0 0 142 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="logo holder">
                                    <g id="Group">
                                        <path id="Vector" d="M46.4154 0.93309C41.6139 0.93309 36.9214 4.38923 36.9214 10.7542L36.9246 10.7575C36.9246 17.0505 41.5801 20.5786 46.7087 20.5786C49.9097 20.5786 52.6375 19.2681 54.2751 17.2315L52.3813 15.2668C50.9989 16.5784 49.1803 17.2315 47.1437 17.2315C43.9056 17.2315 41.3238 15.5557 40.7046 12.2838H55.5453C56.4546 4.35326 51.2169 0.934178 46.4154 0.934178M40.6708 9.30415C41.2497 5.95703 43.7595 4.35652 46.4525 4.35652C49.1454 4.35652 51.7653 6.03117 51.9834 9.30415H40.6708Z" fill="#1D1D1B"/>
                                        <path id="Vector_2" d="M58.1292 0.93309H62.1304V6.17072C62.7846 3.33385 64.6773 0.93309 68.1345 0.93309C68.5706 0.93309 68.9348 0.970159 69.3371 1.07919V4.90056C68.9359 4.82861 68.6088 4.79154 68.1727 4.79154C64.5737 4.79154 62.1348 7.41036 62.1348 11.3746V20.5786H58.1335V0.93309H58.1302H58.1292Z" fill="#1D1D1B"/>
                                        <path id="Vector_3" d="M84.0753 9.37176C84.0753 6.31683 82.5838 4.57023 80.074 4.57023C77.5642 4.57023 75.8176 6.31683 75.8176 9.37176V20.6178H71.8163V0.934189H75.8176V3.98911C76.8021 2.31665 78.5825 0.934189 81.4194 0.934189C83.8921 0.934189 86.0029 2.02446 87.1673 4.39033C88.1856 2.5347 90.2593 0.934189 93.4974 0.934189C97.4616 0.934189 100.373 3.44398 100.373 9.15479V20.6189H96.3342V9.37285C96.3342 6.31792 94.8428 4.57132 92.333 4.57132C89.8232 4.57132 88.1136 6.31792 88.1136 9.37285V20.6189H84.0753V9.37285V9.37176Z" fill="#1D1D1B"/>
                                        <path id="Vector_4" d="M117.912 9.30415C117.694 6.03117 115.075 4.35652 112.382 4.35652C109.689 4.35652 107.178 5.95703 106.599 9.30415H117.912ZM102.853 10.7542C102.853 4.38923 107.545 0.93309 112.347 0.93309C117.148 0.93309 122.386 4.35216 121.477 12.2838H106.636C107.256 15.5568 109.837 17.2315 113.076 17.2315C115.113 17.2315 116.932 16.5773 118.314 15.2657L120.204 17.2315C118.566 19.2681 115.839 20.5786 112.638 20.5786C107.509 20.5786 102.854 17.0505 102.854 10.7575" fill="#1D1D1B"/>
                                        <path id="Vector_5" d="M141.646 12.7003C141.641 9.98773 141.637 7.27733 141.637 4.39467V0.946162H134.321C131.555 0.826233 128.895 1.78566 127.015 3.5846C125.122 5.39662 124.122 7.88897 124.122 10.7923C124.122 17.2206 129.255 20.6887 134.085 20.6887C135.317 20.6887 136.57 20.4619 137.724 20.0313V21.3777C137.724 24.099 135.528 26.5281 132.725 26.9087C132.313 26.9643 131.195 26.9555 130.527 26.9501C130.357 26.949 130.211 26.9501 130.105 26.9479H130.005L128.377 30.8107H128.606C128.888 30.8074 129.247 30.8085 129.641 30.8107C129.944 30.8107 130.269 30.8129 130.596 30.8129C131.439 30.8129 132.298 30.8042 132.865 30.7606C133.714 30.6962 134.448 30.561 135.108 30.3463C136.538 29.8807 137.865 29.0358 138.946 27.9019C140.696 26.067 141.683 23.5615 141.654 21.0299C141.654 18.1342 141.65 15.4162 141.646 12.6992M137.725 15.4358C136.73 16.2655 135.44 16.7223 134.086 16.7223L133.934 16.7256C131.871 16.707 130.198 15.7781 129.211 14.0991C128.079 12.1759 128.064 9.58216 129.173 7.64475C130.2 5.848 132.027 4.85912 134.316 4.85912H137.725V15.4358Z" fill="#1D1D1B"/>
                                        <path id="Vector_6" d="M0.814941 20.5786H5.08769L13.4021 0.933105H9.09442L0.814941 20.5786Z" fill="#E52234"/>
                                        <path id="Vector_7" d="M35.5988 0.93309H31.4504L25.7396 15.0117L19.9917 0.93309H15.8814L22.2976 16.1717L24.1707 20.6178H26.6118H27.2714L35.5988 0.93309Z" fill="#1D1D1B"/>
                                    </g>
                                </g>
                            </svg>

                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to DataForge!</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </div>
                            <p-button label="Sign In" styleClass="w-full" routerLink="/"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;
}
