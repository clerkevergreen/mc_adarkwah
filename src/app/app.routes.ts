import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PastEventsComponent } from './pages/past-events/past-events.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'past-events', component: PastEventsComponent },
  { path: 'events/:slug', component: EventDetailComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
