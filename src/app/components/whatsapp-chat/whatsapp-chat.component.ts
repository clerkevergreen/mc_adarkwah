import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-chat.component.html',
  styleUrls: ['./whatsapp-chat.component.scss'],
})
export class WhatsappChatComponent {
  phoneNumber = '447507615314';
  message = 'Hello MC Adarkwah! I would like to inquire about your services.';

  openWhatsApp(): void {
    const url = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
    window.open(url, '_blank');
  }
}
