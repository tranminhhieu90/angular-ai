import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GridShapeComponent } from '../../shared/components/grid-shape/grid-shape.component';

@Component({
  selector: 'app-auth-page-layout',
  imports: [RouterModule, GridShapeComponent],
  templateUrl: './auth-page-layout.component.html',
  styles: ``,
})
export class AuthPageLayoutComponent {}
