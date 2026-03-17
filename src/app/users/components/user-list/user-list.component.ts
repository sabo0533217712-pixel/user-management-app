import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { loadUsers, deleteUser } from '../../store/user.actions';
import {
  selectUsers,
  selectLoading,
  selectError,
} from '../../store/user.selectors';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private readonly store = inject(Store);

  readonly users = this.store.selectSignal(selectUsers);
  readonly loading = this.store.selectSignal(selectLoading);
  readonly error = this.store.selectSignal(selectError);

  readonly displayedColumns = ['id', 'email', 'username', 'age', 'actions'];

  ngOnInit(): void {
    if (!this.users().length) {
      this.store.dispatch(loadUsers());
    }
  }

  onEdit(user: User): void {
  }

  onDelete(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete "${user.username}"?`);
    if (!confirmed) {
      return;
    }

    console.log('Deleting user', user);
    this.store.dispatch(deleteUser({ id: user.id }));
  }
}

