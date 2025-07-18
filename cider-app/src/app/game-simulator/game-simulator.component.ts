import { Component } from '@angular/core';
import { DecksService } from '../data-services/services/decks.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { Card } from '../data-services/types/card.type';
import { MenuItem } from 'primeng/api/menuitem';
import { ContextMenu } from 'primeng/contextmenu';
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import StringUtils from '../shared/utils/string-utils';
import MathUtils from '../shared/utils/math-utils';

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
  shuffling?: boolean;
}

interface GameCard extends Positionable {
  uniqueId: string;
  card: Card;
  faceUp: boolean;
  magnified?: boolean;
}

interface GameComponent extends Positionable {
  uniqueId: string;
  type: 'coin' | 'cube' | 'd6';
  className: string;
  faceUp: boolean;
  face?: number;
  rolling?: boolean;
  contextMenu: MenuItem[];
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
  private static readonly COLORS = ['silver', 'gold', 'crimson', 
    'emerald', 'azure', 'lilac', 'ivory', 'charcoal'];
  stacks: CardStack[] = [];
  field: CardZone = { name: 'Field', cards: [] };
  components: GameComponent[] = [];
  // hand: CardZone = { name: 'Hand', cards: [] };
  discard: CardStack = { 
    name: 'Discard', cards: [], faceUp: true,
    uniqueId: StringUtils.generateRandomString(),
    pos: { x: 0, y: 0 },
    deletable: false};
  zoomLevel: number = 0.20;
  zoomMagnifiedLevel: number = 0.40;
  contextMenuItems: MenuItem[] = [];
  hoveredItem: Positionable | undefined;
  draggingCard: boolean = false;
  draggingComponent: boolean = false;

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
      return decks.forEach((deck, index) => {
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
          const dropPos: Position = {
            x: (index % 4) * 200,
            y: Math.floor(index / 4) * 300
          };
          stacks.push({ 
            uniqueId: StringUtils.generateRandomString(),
            name: deck.name,
            cards: expandedCards,
            faceUp: false,
            pos: dropPos,
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
        pos: { x: 800, y: 0 },
        deletable: false,
      };
      stacks.push(this.discard);

      this.stacks = stacks;
      this.field.cards = [];
      // this.hand.cards = [];
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

  public drawCard(stack: CardStack, faceUp: boolean = true) {
    if (stack.cards.length > 0) {
      const drawnCard = stack.cards.pop();
      if (drawnCard) {
        // change position to deck position + offset
        drawnCard.pos.x = stack.pos.x + 50 + (Math.random() * 20 - 10);
        drawnCard.pos.y = stack.pos.y + 50 + (Math.random() * 20 - 10);
        drawnCard.faceUp = faceUp;
        this.field.cards.push(drawnCard);
      }
    }
  }

  public drawSpecificCardFromStack(stack: CardStack, cardToDraw: GameCard) {
    const cardIndex = stack.cards.findIndex(c => c.uniqueId === cardToDraw.uniqueId);

    if (cardIndex > -1) {
      // Remove the specific card from the stack array
      const [drawnCard] = stack.cards.splice(cardIndex, 1);
      
      // Set its properties for being on the field
      drawnCard.faceUp = true;
      // Position it near the stack it came from for a better user experience
      drawnCard.pos.x = stack.pos.x + 40;
      drawnCard.pos.y = stack.pos.y + 40;

      // Add the card to the field
      this.field.cards.push(drawnCard);
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

  public deleteItem(items: Positionable[], item: Positionable) {
    const index = items.indexOf(item);
    if (index > -1) {
      items.splice(index, 1);
    }
  }

  public onStackContextMenu(event: MouseEvent, cm: ContextMenu, stack: CardStack) {
    event.preventDefault();
    this.contextMenuItems = [
      {
        label: 'Draw Card',
        icon: 'pi pi-plus',
        command: () => this.drawCard(stack),
        disabled: stack.cards.length === 0
      },
      {
        label: 'Draw Card Facedown',
        icon: 'pi pi-eye-slash',
        command: () => this.drawCard(stack, false),
        disabled: stack.cards.length === 0
      },
      {
        label: 'Draw Specific Card',
        icon: 'pi pi-id-card',
        disabled: stack.cards.length === 0,
        // Dynamically create a submenu for each card in the stack
        items: stack.cards.map(gameCard => ({
          label: gameCard.card.name,
          command: () => this.drawSpecificCardFromStack(stack, gameCard)
        }))
      },
      {
        label: 'Shuffle Stack',
        icon: 'pi pi-arrow-right-arrow-left',
        command: (event) => {
          stack.shuffling = true;
          setTimeout(() => {
            this.shuffleCards(stack.cards);
            stack.shuffling = false;
          }, 600);
        },
        disabled: stack.cards.length < 2
      },
      {
        label: 'Flip Stack',
        icon: 'pi pi-refresh',
        command: () => this.flipStack(stack),
        disabled: stack.cards.length === 0
      },
      {
        label: 'Split in Half',
        icon: 'pi pi-clone',
        command: () => this.splitInHalf(stack),
        disabled: stack.cards.length < 2
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteItem(this.stacks, stack),
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

  public onComponentContextMenu(event: MouseEvent, cm: ContextMenu, 
    component: GameComponent) {
    event.preventDefault();
    this.contextMenuItems = [
      ...component.contextMenu,
      {
        label: 'Duplicate',
        icon: 'pi pi-clone',
        command: () => this.components.push({
          ...component,
          uniqueId: 'coin-' + StringUtils.generateRandomString(),
          pos: { 
            x: component.pos.x + 10 + (Math.random() * 10 - 5), 
            y: component.pos.y + 10 + (Math.random() * 10 - 5)
          },
        }),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteItem(this.components, component),
      },
    ];
    this.contextMenuItems.forEach(item => {
      item.state = component;
    })
    cm.show(event);
  }

  public onFieldContextMenu(event: MouseEvent, cm: ContextMenu) {
    event.preventDefault();
    this.contextMenuItems = [
      {
        label: 'Add Coin',
        icon: 'pi pi-plus',
        items: GameSimulatorComponent.COLORS.map(color => ({
          label: color,
          command: () => {
            const component: GameComponent = {
              uniqueId: 'coin-' + StringUtils.generateRandomString(),
              type: 'coin',
              className: 'game-coin color-' + color,
              faceUp: true,
              pos: { 
                x: event.offsetX, 
                y: event.offsetY
              },
              contextMenu: [],
            };
            component.contextMenu = [
              {
                label: 'Flip Randomly',
                icon: 'pi pi-percentage',
                command: (event) => {
                  const componentState: GameComponent | undefined = 
                    event.item?.state as GameComponent;
                  componentState.rolling = true;
                  setTimeout(() => {
                    componentState.faceUp = Math.random() < 0.5;
                    componentState.rolling = false;
                  }, 600);
                }
              },
              {
                label: 'Flip Over',
                icon: 'pi pi-refresh',
                command: (event) => {
                  const componentState: GameComponent | undefined = 
                    event.item?.state as GameComponent;
                  componentState.faceUp = !componentState.faceUp;
                }
              },
            ];
            this.components.push(component);
          }
        }))
      },
      {
        label: 'Add Cube',
        icon: 'pi pi-plus',
        items: GameSimulatorComponent.COLORS.map(color => ({
          label: color,
          command: () => {
            const component: GameComponent = {
              uniqueId: 'cube-' + StringUtils.generateRandomString(),
              type: 'cube',
              className: `game-cube color-${color}`,
              faceUp: true,
              pos: { 
                x: event.offsetX, 
                y: event.offsetY
              },
              contextMenu: [
                {
                  label: 'Flip Over',
                  icon: 'pi pi-refresh',
                  command: (event) => {
                    const componentState: GameComponent | undefined = 
                      event.item?.state as GameComponent;
                    componentState.faceUp = !componentState.faceUp;
                  }
                },
              ],
            };
            this.components.push(component);
          }
        }))
      },
      {
        label: 'Add Die (D6)',
        icon: 'pi pi-plus',
        items: GameSimulatorComponent.COLORS.map(color => ({
          label: color,
          command: () => {
            const component: GameComponent = {
              uniqueId: 'd6-' + StringUtils.generateRandomString(),
              type: 'd6',
              className: `game-d6 color-${color}`,
              faceUp: true,
              face: 6,
              pos: { 
                x: event.offsetX, 
                y: event.offsetY
              },
              contextMenu: [
                {
                  label: 'Roll Die',
                  icon: 'pi pi-percentage',
                  command: (event) => {
                    const componentState: GameComponent | undefined = 
                      event.item?.state as GameComponent;
                    componentState.rolling = true;
                    setTimeout(() => {
                      componentState.face = MathUtils.randomInt(1, 6);
                      componentState.rolling = false;
                    }, 600);
                  }
                },
              ],
            };
            this.components.push(component);
          }
        }))
      },
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

  public onDragStarted(event: any, items: Positionable[], item: Positionable) {
    // send card to the end of the cards array
    const index = items.indexOf(item);
    if (index > -1) {
      items.splice(index, 1);
      items.push(item);
    }
    this.hoveredItem = undefined;
  }

  public onCardDragStarted(event: any, items: Positionable[], item: Positionable) {
    this.onDragStarted(event, items, item);
    this.draggingCard = true;
  }

  onDragEnded(event: CdkDragEnd<any>, items: Positionable[], item: Positionable) {
    item.pos.x += event.distance.x;
    item.pos.y += event.distance.y;
    // this.dragging = false;
  }

  onCardDragEnded(event: CdkDragEnd<any>, cards: GameCard[], card: GameCard) {
    card.pos.x += event.distance.x;
    card.pos.y += event.distance.y;
    if (this.hoveredItem) {
      const index = cards.indexOf(card);
      cards.splice(index, 1);
      (this.hoveredItem as any).cards.push(card);
    }
    this.draggingCard = false;
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

  onCardMouseDown(event: MouseEvent, card: GameCard) {
    if (event.button == 1) {
      card.magnified = true;
    }
  }

  onCardMouseUp(event: MouseEvent, card: GameCard) {
    if (event.button == 1) {
      card.magnified = false;
    }
  }

}
