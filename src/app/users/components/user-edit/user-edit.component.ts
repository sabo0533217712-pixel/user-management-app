import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { User } from '../../models/user.model';
import { selectUserById } from '../../store/user.selectors';
import { loadUsers, updateUser } from '../../store/user.actions';

function forbiddenUsernameValidator(forbidden: string): ValidatorFn {
  const lowerForbidden = forbidden.toLowerCase();
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null | undefined = control.value;
    if (!value) {
      return null;
    }
    return value.toLowerCase() === lowerForbidden
      ? { forbiddenUsername: { forbidden } }
      : null;
  };
}

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private userId!: number;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: [
      '',
      [
        Validators.required,
        //No spaces, minimum length 3 characters
        Validators.pattern(/^[^\s]{3,}$/),
        forbiddenUsernameValidator('admin'),
      ],
    ],
    age: [
      null as number | null,
      [Validators.required, Validators.min(18), Validators.max(100)],
    ],
  });

  get email(): AbstractControl {
    return this.form.get('email') as AbstractControl;
  }

  get username(): AbstractControl {
    return this.form.get('username') as AbstractControl;
  }

  get age(): AbstractControl {
    return this.form.get('age') as AbstractControl;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.userId = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(this.userId)) {
      console.error('Invalid user id in route params:', idParam);
      return;
    }

    this.store.dispatch(loadUsers());

    this.store
      .select(selectUserById(this.userId))
      .pipe(
        filter((user): user is User => !!user),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((user) => {
        this.patchForm(user);
      });
  }

  private patchForm(user: User): void {
    this.form.patchValue(
      {
        email: user.email,
        username: user.username,
        age: user.age,
      },
      { emitEvent: false }
    );
  }

  onSubmit(): void {
    if (this.form.invalid || !Number.isFinite(this.userId)) {
      return;
    }

    const { email, username, age } = this.form.value;
    const updated: User = {
      id: this.userId,
      email: email!,
      username: username!,
      age: age as number,
    };

    console.log('Saving user', updated);
    this.store.dispatch(updateUser({ user: updated }));
    this.router.navigate(['/users']);
  }
}

