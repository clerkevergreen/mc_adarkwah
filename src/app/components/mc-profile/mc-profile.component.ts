import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-mc-profile',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './mc-profile.component.html',
  styleUrls: ['./mc-profile.component.scss'],
})
export class McProfileComponent implements OnInit {
  aboutInfo: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.aboutInfo = this.dataService.getAboutInfo();
  }
}
