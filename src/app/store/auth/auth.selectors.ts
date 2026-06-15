import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);

export const selectIsAuthenticated = createSelector(selectCurrentUser, (user) => user !== null);
