import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './layouts/nav-bar/nav-bar.component';
import { MainComponent } from './layouts/main/main.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { BookPageComponent } from './layouts/book-page/book-page.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    MainComponent,
    PageNotFoundComponent,
    BookPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
