import { Component } from '@angular/core';
import { DecksService } from '../data-services/services/decks.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { Deck } from '../data-services/types/deck.type';
import { Card } from '../data-services/types/card.type';

interface CardZone {
  name: string;
  cards: Card[];
}

interface CardStack {
  deckId: number;
  name: string;
  cards: Card[];
}

@Component({
  selector: 'app-game-simulator',
  templateUrl: './game-simulator.component.html',
  styleUrl: './game-simulator.component.scss'
})
export class GameSimulatorComponent {
  stacks: CardStack[] = [];
  field: CardZone = { name: 'Field', cards: [] };
  hand: CardZone = { name: 'Hand', cards: [] };
  discard: CardZone = { name: 'Discard', cards: [] };
  zoomLevel: number = 0.20;

  constructor(
    private decksService: DecksService,
    private cardsService: CardsService,
    public cardTemplatesService: CardTemplatesService) {
    // Initialize the component, if needed
    this.resetGame();
  }

  private resetGame() {
    const stacks: CardStack[] = [];
    this.decksService.getAll().then(decks => {
      decks.forEach(deck => {
        this.cardsService.getAll({ deckId: deck.id }).then(cards => {
          const expandedCards: Card[] = [];
          cards.forEach(card => {
            for (let i = 0; i < card.count; i++) {
              expandedCards.push({
                ...card,
                uniqueId: `${card.id}-${Math.random().toString(36).substr(2, 9)}` // Ensure unique ID for each card instance
              } as any);
            }
          });
          this.shuffleCards(expandedCards);
          stacks.push({ 
            deckId: deck.id,
            name: deck.name,
            cards: expandedCards 
          });
        });
      });
    });

    this.stacks = stacks;
    this.field.cards = [];
    this.hand.cards = [];
    this.discard.cards = [];
  }

  public shuffleCards(cards: Card[]) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  public drawCard(cards: Card[]) {
    if (cards.length > 0) {
      const drawnCard = cards.pop();
      if (drawnCard) {
        // this.hand.cards.push(drawnCard);
        this.field.cards.push(drawnCard);
      }
    }
  }

  public playCard(cards: Card[], card: Card) {
    const index = cards.indexOf(card);
    if (index > -1) {
      cards.splice(index, 1);
      this.field.cards.push(card);
    }
  }

  public discardCard(cards: Card[], card: Card) {
    const index = cards.indexOf(card);
    if (index > -1) {
      cards.splice(index, 1);
      this.discard.cards.push(card);
    }
  }

}
