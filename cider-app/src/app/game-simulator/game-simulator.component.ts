import { Component } from '@angular/core';
import { DecksService } from '../data-services/services/decks.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { Deck } from '../data-services/types/deck.type';
import { Card } from '../data-services/types/card.type';
import { MenuItem } from 'primeng/api/menuitem';
import { ContextMenu } from 'primeng/contextmenu';
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import StringUtils from '../shared/utils/string-utils';

interface CardZone {
  name: string;
  cards: GameCard[];
}

interface CardStack extends Positionable {
  uniqueId: string;
  name: string;
  cards: GameCard[];
  faceUp: boolean;
  deletable: boolean;
}

interface GameCard extends Positionable {
  uniqueId: string;
  card: Card;
  faceUp: boolean;
}

interface Positionable {
  pos: Position;
}

interface Position {
  x: number;
  y: number;
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
  discard: CardStack = { 
    name: 'Discard', cards: [], faceUp: true,
    uniqueId: StringUtils.generateRandomString(),
    pos: { x: 0, y: 0 },
    deletable: false};
  zoomLevel: number = 0.20;
  contextMenuItems: MenuItem[] = [];
  hoveredItem: Positionable | undefined;
  dragging: boolean = false;

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
      return decks.forEach(deck => {
        return this.cardsService.getAll({ deckId: deck.id }).then(cards => {
          const expandedCards: GameCard[] = [];
          cards.forEach(card => {
            for (let i = 0; i < card.count; i++) {
              expandedCards.push({
                // Ensure unique ID for each card instance
                uniqueId: StringUtils.generateRandomString(),
                card: card,
                faceUp: true,
                pos: { x: 0, y: 0 }
              } as GameCard);
            }
          });
          this.shuffleCards(expandedCards);
          stacks.push({ 
            uniqueId: StringUtils.generateRandomString(),
            name: deck.name,
            cards: expandedCards,
            faceUp: false,
            pos: { x: 0, y: 0 },
            deletable: true,
          });
        });
      });
    }).then(result => {
      this.discard = { 
        name: 'Discard', 
        cards: [], 
        uniqueId: StringUtils.generateRandomString(),
        faceUp: true,
        pos: { x: 0, y: 0 },
        deletable: false,
      };
      stacks.push(this.discard);

      this.stacks = stacks;
      this.field.cards = [];
      this.hand.cards = [];
      this.discard.cards = [];
    });
  }

  public shuffleCards(cards: GameCard[]) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  public flipStack(stack: CardStack) {
    stack.cards = stack.cards.reverse();
    stack.faceUp = !stack.faceUp;
  }

  public drawCard(cards: GameCard[], faceUp: boolean = true) {
    if (cards.length > 0) {
      const drawnCard = cards.pop();
      if (drawnCard) {
        // change position to deck position + offset
        drawnCard.pos.x = 100;
        drawnCard.pos.y = 100;
        drawnCard.faceUp = faceUp;
        this.field.cards.push(drawnCard);
      }
    }
  }

  public playCard(cards: GameCard[], card: GameCard) {
    const index = cards.indexOf(card);
    if (index > -1) {
      cards.splice(index, 1);
      this.field.cards.push(card);
    }
  }

  public discardCard(cards: GameCard[], card: GameCard) {
    const index = cards.indexOf(card);
    if (index > -1) {
      cards.splice(index, 1);
      this.discard.cards.push(card);
    }
  }

  public deleteStack(stack: CardStack) {
    const index = this.stacks.indexOf(stack);
    if (index > -1) {
      this.stacks.splice(index, 1);
    }
  }

  public onStackContextMenu(event: MouseEvent, cm: ContextMenu, stack: CardStack) {
    event.preventDefault();
    this.contextMenuItems = [
      {
        label: 'Draw Card',
        icon: 'pi pi-plus',
        command: () => this.drawCard(stack.cards)
      },
      {
        label: 'Draw Card Facedown',
        icon: 'pi pi-eye-slash',
        command: () => this.drawCard(stack.cards, false)
      },
      {
        label: 'Shuffle Stack',
        icon: 'pi pi-arrow-right-arrow-left',
        command: () => this.shuffleCards(stack.cards)
      },
      {
        label: 'Flip Stack',
        icon: 'pi pi-refresh',
        command: () => this.flipStack(stack)
      },
      {
        label: 'Split in Half',
        icon: 'pi pi-clone',
        command: () => this.splitInHalf(stack)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteStack(stack),
        disabled: !stack.deletable
      },
    ];
    cm.show(event);
  }

  public onCardContextMenu(event: MouseEvent, cm: ContextMenu, card: GameCard) {
    event.preventDefault();
    this.contextMenuItems = [
      {
        label: 'Flip Card',
        icon: 'pi pi-refresh',
        command: () => {
          // Logic to flip the card, if applicable
          card.faceUp = !card.faceUp;
        }
      },
      {
        label: 'Create Stack',
        icon: 'pi pi-book',
        command: () => this.createStack(this.field.cards, card)
      },
      {
        label: 'Discard Card',
        icon: 'pi pi-trash',
        command: () => this.discardCard(this.field.cards, card)
      }
    ];
    cm.show(event);
  }

  public createStack(cards: GameCard[], card: GameCard) {
    const index = cards.indexOf(card);
    if (index < 0) {
      return
    }
    cards.splice(index, 1);
    const newCards: GameCard[] = [card];
    this.stacks.push({
      uniqueId: StringUtils.generateRandomString(),
      name: 'stack-' + StringUtils.generateRandomString(3),
      cards: newCards,
      faceUp: true,
      pos: { x: card.pos.x, y: card.pos.y },
      deletable: true,
    });
  }

  public splitInHalf(stack: CardStack) {
    if (stack.cards.length < 2) {
      return;
    }
    // split the stack in half and push the new stack into the stacks array
    const cards = stack.cards.splice(
      Math.floor(stack.cards.length / 2) - 1, 
      Math.floor(stack.cards.length / 2));
    this.stacks.push({
      uniqueId: StringUtils.generateRandomString(),
      name: stack.name + ' copy',
      cards: cards,
      faceUp: false,
      pos: { x: 0, y: 0 },
      deletable: true,
    });
  }

  public onDragStarted(event: any, cards: GameCard[], card: GameCard) {
    // send card to the end of the cards array
    const index = cards.indexOf(card);
    if (index > -1) {
      cards.splice(index, 1);
      cards.push(card);
    }
    this.dragging = true;
    this.hoveredItem = undefined;
  }

  // onCardDropped(event: CdkDragDrop<GameCard[]>) {
  //   console.log('card dropped: ', event);
  //   if (event.previousContainer === event.container) {
  //     // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //     console.log('container is the same, ignore');
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex,
  //     );
  //   }
  // }

  onDragEnded(event: CdkDragEnd<any>, cards: GameCard[], card: GameCard) {
    console.log('drag ended: ', event, card);
    card.pos.x += event.distance.x;
    card.pos.y += event.distance.y;
    console.log('hovered: ', this.hoveredItem);
    if (this.hoveredItem) {
      const index = cards.indexOf(card);
      cards.splice(index, 1);
      (this.hoveredItem as any).cards.push(card);
    }
    this.dragging = false;
  }

  onDragEntered(event: CdkDragEnter<any>, item: Positionable) {
    console.log('drag entered: ', event, item);
  }

  onMouseEntered(event: any, item: Positionable) {
    if (this.hoveredItem == item) {
      return;
    }
    // console.log('mouse entered: ', event, item);
    this.hoveredItem = item;
  }

  onMouseExited(event: any, item: Positionable) {
    // console.log('mouse exited: ', event, item);
    if (this.hoveredItem == item) {
      this.hoveredItem = undefined;
    }
  }


  changePosition(event: CdkDragDrop<any>, item: Positionable) {
    // const rectZone=this.dropZone.nativeElement.getBoundingClientRect()
    // const rectElement=event.item.element.nativeElement.getBoundingClientRect()

    // let y=+field.y+event.distance.y
    // let x=+field.x+event.distance.x
    // const out=y<0 || x<0 || (y>(rectZone.height-rectElement.height)) || (x>(rectZone.width-rectElement.width))
    
    // if (!out)
    // {
    //    field.y=y
    //    field.x=x
    //    this.done=this.done.sort((a,b)=>a['z-index']>b['z-index']?1:a['z-index']<b['z-index']?-1:0)
    // }
    // else{
    //   this.todo.push(field)
    //   this.done=this.done.filter(x=>x!=field)
    // }
    console.log('drag dropped', event, item);
    item.pos.x += event.distance.x;
    item.pos.y += event.distance.y;
  }

}
