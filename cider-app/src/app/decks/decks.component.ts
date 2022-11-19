import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { DecksService } from '../data-services/services/decks.service';
import { EntityField } from '../data-services/types/entity-field.type';
import { Deck } from '../data-services/types/deck.type';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  cols: EntityField<Deck>[];
  decks: Deck[];
  selectedDeck: Deck | undefined;

  constructor(public decksService: DecksService, 
    private router: Router) {
    this.cols = [];
    this.decks = [];
    this.selectedDeck = undefined;
  }

  ngOnInit(): void {
    this.decksService.getAll().then(decks => this.decks = decks);
    this.decksService.getFields().then(fields => this.cols = fields);
    this.decksService.getSelectedDeck()
    .pipe(take(1))
    // .pipe(takeUntil(this.destroyed$))
    .subscribe({next: (decks) => {
      this.selectedDeck = decks;
    }});
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * Select the deck
   */
  public selectDeck() {
      this.decksService.selectDeck(this.selectedDeck);
      this.router.navigateByUrl(`/decks/${this.selectedDeck?.id}/cards/listing`);
  }

}
