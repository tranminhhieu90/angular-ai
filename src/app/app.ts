import { TuiRoot } from '@taiga-ui/core';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from './core/api/auth.service';
import { authActions } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);

  protected readonly title = signal('angular_ai');

  constructor() {
    this.store.dispatch(
      authActions.sessionRestored({
        user: this.authService.currentUser(),
      }),
    );
  }
}
