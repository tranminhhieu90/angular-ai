import { createReducer, on } from '@ngrx/store';
import { UserProfile } from '@/app/core/models/auth.models';
import { authActions } from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: UserProfile | null;
}

export const initialAuthState: AuthState = {
  user: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(authActions.sessionRestored, authActions.loginSucceeded, (state, { user }) => ({
    ...state,
    user,
  })),
  on(authActions.logoutSucceeded, () => initialAuthState),
);
