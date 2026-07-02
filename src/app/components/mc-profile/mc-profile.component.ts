import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

const defaultAboutInfo = {
  name: 'MC Adarkwah',
  title: 'Professional Master of Ceremonies & Event Host',
  bio: 'One of Africa\'s most sought-after professional Masters of Ceremonies.',
  yearsExperience: 10,
  achievements: [
    'Best Event Host - Ghana Events Awards 2024',
    'Event Host of the Year - African Entertainment Awards 2023',
  ],
  socialMedia: {},
  contact: {},
};

@Component({
  selector: 'app-mc-profile',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './mc-profile.component.html',
  styleUrls: ['./mc-profile.component.scss'],
})
export class McProfileComponent implements OnInit {
  aboutInfo: any = defaultAboutInfo;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getAboutInfo().subscribe(data => {
      if (data) this.aboutInfo = data;
    });
  }
}
