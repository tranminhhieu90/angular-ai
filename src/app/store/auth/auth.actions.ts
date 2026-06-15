import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserProfile } from '@/app/core/models/auth.models';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    'Session Restored': props<{ user: UserProfile | null }>(),
    'Login Succeeded': props<{ user: UserProfile }>(),
    'Logout Succeeded': emptyProps(),
  },
});
