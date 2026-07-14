import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { NewsItem } from '../../models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  newsItems: NewsItem[] = [];
  loading = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getNewsItems().subscribe(data => {
      this.newsItems = data;
      this.loading = false;
    });
  }
}
