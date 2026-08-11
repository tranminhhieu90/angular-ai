import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GridShapeComponent } from '@/app/shared/components/grid-shape/grid-shape.component';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-auth-page-layout',
  imports: [RouterModule, GridShapeComponent, TuiIcon],
  templateUrl: './auth-page-layout.component.html',
  styles: ``,
})
export class AuthPageLayoutComponent {}
