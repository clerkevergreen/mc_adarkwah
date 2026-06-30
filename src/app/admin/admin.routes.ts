import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'events', loadComponent: () => import('./pages/management/events/events.component').then(m => m.EventsComponent) },
      { path: 'bookings', loadComponent: () => import('./pages/management/bookings/bookings.component').then(m => m.BookingsComponent) },
      { path: 'registrations', loadComponent: () => import('./pages/management/registrations/registrations.component').then(m => m.RegistrationsComponent) },
      { path: 'testimonials', loadComponent: () => import('./pages/management/testimonials/testimonials.component').then(m => m.TestimonialsComponent) },
      { path: 'gallery', loadComponent: () => import('./pages/management/gallery/gallery.component').then(m => m.GalleryComponent) },
      { path: 'faqs', loadComponent: () => import('./pages/management/faqs/faqs.component').then(m => m.FaqsComponent) },
      { path: 'news', loadComponent: () => import('./pages/management/news/news.component').then(m => m.NewsComponent) },
      { path: 'sponsors', loadComponent: () => import('./pages/management/sponsors/sponsors.component').then(m => m.SponsorsComponent) },
      { path: 'subscribers', loadComponent: () => import('./pages/management/subscribers/subscribers.component').then(m => m.SubscribersComponent) },
      { path: 'quotes', loadComponent: () => import('./pages/management/quotes/quotes.component').then(m => m.QuotesComponent) },
      { path: 'contact', loadComponent: () => import('./pages/management/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'services', loadComponent: () => import('./pages/management/services/services.component').then(m => m.ServicesComponent) },
      { path: 'hero', loadComponent: () => import('./pages/management/hero/hero.component').then(m => m.HeroComponent) },
      { path: 'nav', loadComponent: () => import('./pages/management/nav/nav.component').then(m => m.NavComponent) },
      { path: 'profile', loadComponent: () => import('./pages/management/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'statistics', loadComponent: () => import('./pages/management/statistics/statistics.component').then(m => m.StatisticsComponent) },
      { path: 'videos', loadComponent: () => import('./pages/management/videos/videos.component').then(m => m.VideosComponent) },
    ],
  },
];
