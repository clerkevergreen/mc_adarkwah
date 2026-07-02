import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  private apiService = inject(ApiService);
  private sanitizer = inject(DomSanitizer);

  contactInfo: any = {};
  formData = { name: '', email: '', subject: '', message: '' };
  submitting = false;
  submitted = false;
  error = '';
  mapUrl: SafeResourceUrl | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getAboutInfo().subscribe(data => {
      if (data?.contact) this.contactInfo = data.contact;
    });
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127068.41427152908!2d-0.2303247504695397!3d5.591668681408301!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a7b3%3A0x8e3f5f5e5b7e8f0!2sAccra%2C%20Ghana!5e0!3m2!1sen!2s!4v1'
    );
  }

  getWhatsAppLink(): string {
    const num = (this.contactInfo?.whatsapp || '').replace(/\D/g, '');
    return num ? `https://wa.me/${num}` : 'https://wa.me/233200000000';
  }

  submitForm(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.message) return;
    this.submitting = true;
    this.error = '';
    this.apiService.submitContact(this.formData).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.formData = { name: '', email: '', subject: '', message: '' };
      },
      error: () => {
        this.error = 'Failed to send message. Please try again.';
        this.submitting = false;
      },
    });
  }
}
