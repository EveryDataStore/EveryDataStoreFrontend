import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { MustMatch } from 'src/app/shared/validators/must-match';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {

  public passwordForm: UntypedFormGroup;
  public slug: any;
  public token: any;

  constructor(private fb: UntypedFormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiService,
              private messageService: MessageUtilService) {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      const slug = params.get('Slug');
      const token = params.get('Token');
      if (!slug || !token) {
        this.router.navigateByUrl('/login');
        this.messageService.showError('Token or Slug Not Found');
      }
      this.checkAuthLoginToken(slug, token);
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  get f() {
    return this.passwordForm.controls;
  }

  async checkAuthLoginToken(slug, token) {
    const result: any = await this.apiService.checkAuthLoginToken(slug, token);
    if (!result || !result.Token || !result.Slug) {
      this.messageService.showError(result);
      return this.router.navigateByUrl('/login');
    }
    this.token = result.Token;
    this.slug = result.Slug;
  }

  initializeForm() {
    this.passwordForm = this.fb.group({
      password: new UntypedFormControl(null, Validators.required),
      confirmPassword: new UntypedFormControl(null, Validators.required)
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  async send() {
    const result: any = await this.apiService.resetPassword(this.token, this.slug, this.passwordForm.value.password);

    if (result === 'OK') {
      this.messageService.showSuccess('Password Updated');
      this.router.navigateByUrl('/login');
    } else {
      this.messageService.showError(result);
    }
  }
}
