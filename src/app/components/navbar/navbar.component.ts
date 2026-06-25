import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavItem } from '../../models/navigation.model';
import { DataService } from '../../services/data.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  navItems: NavItem[] = [];
  isScrolled = false;
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  currency: CurrencyCode = 'GHS';

  constructor(
    private dataService: DataService,
    private router: Router,
    public currencyService: CurrencyService,
  ) {
    this.currencyService.currency$.subscribe(c => this.currency = c);
  }

  ngOnInit(): void {
    this.dataService.getNavItems().subscribe(items => {
      this.navItems = items;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  scrollToSection(fragment: string): void {
    this.closeMobileMenu();
    if (this.router.url !== '/') {
      this.router.navigate(['/'], { fragment });
      return;
    }
    const element = document.getElementById(fragment);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
