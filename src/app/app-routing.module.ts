import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layouts/main/main.component';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { BookPageComponent } from './layouts/book-page/book-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'main/books', pathMatch: 'full' },
  { path: 'main', redirectTo: 'main/books', pathMatch: 'full' },
  {
    path: 'main',
    component: MainComponent,
    children: [
      {
        path: 'books',
        component: BookPageComponent,
      },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
