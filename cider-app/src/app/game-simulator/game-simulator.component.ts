import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { DecksService } from '../data-services/services/decks.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { Card } from '../data-services/types/card.type';
import { FieldType } from '../data-services/types/field-type.type';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { CdkDragDrop, CdkDragEnd, CdkDragEnter, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import StringUtils from '../shared/utils/string-utils';
import MathUtils from '../shared/utils/math-utils';
import { EntityField } from '../data-services/types/entity-field.type';
import { TranslateService } from '@ngx-translate/core';

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
  flipping?: boolean;
}

interface GameCard extends Positionable {
  uniqueId: string;
  card: Card;
  faceUp: boolean;
  matchId?: string;
  discarding?: boolean;
  drawing?: boolean;
  flipping?: boolean;
}

interface GameComponent extends Positionable {
  uniqueId: string;
  type: 'coin' | 'cube' | 'd6';
  className: string;
  faceUp: boolean;
  face?: number;
  rolling?: boolean;
  flipping?: boolean;
  contextMenu: MenuItem[];
}

interface Positionable {
  pos: Position;
  zIndex?: number;
}

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-game-simulator',
  templateUrl: './game-simulator.component.html',
  styleUrl: './game-simulator.component.scss',
  standalone: false
})
export class GameSimulatorComponent {
  private static readonly COLORS = ['silver', 'gold', 'crimson',
    'emerald', 'azure', 'lilac', 'ivory', 'charcoal'];
  public static readonly BASE_CARD_WIDTH = 825; // Approximated from visual reference or default - Fallback only
  public static readonly BASE_CARD_HEIGHT = 1125;

  public readonly baseCardWidth = GameSimulatorComponent.BASE_CARD_WIDTH;
  public readonly baseCardHeight = GameSimulatorComponent.BASE_CARD_HEIGHT;

  @ViewChild('gameBoundary') gameBoundary!: ElementRef;
  stacks: CardStack[] = [];
  field: CardZone = { name: 'Field', cards: [] };
  components: GameComponent[] = [];
  // hand: CardZone = { name: 'Hand', cards: [] };
  discard: CardStack = {
    name: 'Discard', cards: [], faceUp: true,
    uniqueId: StringUtils.generateRandomString(),
    pos: { x: 0, y: 0 },
    deletable: false
  };
  zoomLevel: number = 0.20;
  zoomMagnifiedLevel: number = 0.40;
  contextMenuItems: MenuItem[] = [];
  hoveredItem: Positionable | undefined;
  topZIndex: number = 100;
  draggingCard: boolean = false;
  draggingStack: boolean = false;
  draggingComponent: boolean = false;

  renameDialogVisible: boolean = false;
  renameStackName: string = '';
  stackToRename: CardStack | undefined;

  saveStackName() {
    if (this.stackToRename && this.renameStackName.trim().length > 0) {
      this.stackToRename.name = this.renameStackName;
      this.renameDialogVisible = false;
    }
  }

  cancelRename() {
    this.renameDialogVisible = false;
    this.stackToRename = undefined;
    this.renameStackName = '';
  }

  drawSpecificCardDialogVisible: boolean = false;
  drawSpecificCardSearchQuery: string = '';
  drawSpecificCardStack: CardStack | undefined;
  filteredCards: GameCard[] = [];

  openDrawSpecificCardDialog(stack: CardStack) {
    this.drawSpecificCardStack = stack;
    this.drawSpecificCardSearchQuery = '';
    this.filterCards();
    this.drawSpecificCardDialogVisible = true;
  }

  filterCards() {
    if (!this.drawSpecificCardStack) {
      this.filteredCards = [];
      return;
    }
    if (!this.drawSpecificCardSearchQuery.trim()) {
      this.filteredCards = [...this.drawSpecificCardStack.cards];
    } else {
      const query = this.drawSpecificCardSearchQuery.toLowerCase();
      this.filteredCards = this.drawSpecificCardStack.cards.filter(gameCard =>
        gameCard.card.name.toLowerCase().includes(query)
      );
    }
  }

  onDrawSpecificCardSelect(card: GameCard) {
    if (this.drawSpecificCardStack) {
      this.drawSpecificCardFromStack(this.drawSpecificCardStack, card);
      this.drawSpecificCardDialogVisible = false;
      this.drawSpecificCardStack = undefined;
    }
  }

  constructor(
    private decksService: DecksService,
    private cardsService: CardsService,
    private translate: TranslateService,
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
    if (stack.cards.length === 0 || stack.flipping) {
      return;
    }

    stack.flipping = true;
    setTimeout(() => {
      stack.cards = stack.cards.reverse();
      stack.faceUp = !stack.faceUp;
    }, 200);

    setTimeout(() => {
      stack.flipping = false;
    }, 400);
  }

  public drawCard(stack: CardStack, faceUp: boolean = true) {
    if (stack.cards.length > 0) {
      const drawnCard = stack.cards.pop();
      if (drawnCard) {
        // change position to deck position + offset
        // Reverted to bottom-right offset
        let newX = stack.pos.x + 100 + (Math.random() * 20 - 10);
        let newY = stack.pos.y + 50 + (Math.random() * 20 - 10);

        let width = GameSimulatorComponent.BASE_CARD_WIDTH * this.zoomLevel;
        let height = GameSimulatorComponent.BASE_CARD_HEIGHT * this.zoomLevel;

        const stackEl = document.getElementById(stack.uniqueId);
        let startX = stack.pos.x;
        let startY = stack.pos.y;

        if (stackEl && this.gameBoundary) {
          const rect = stackEl.getBoundingClientRect();
          width = rect.width;
          height = rect.height;

          const boundaryRect = this.gameBoundary.nativeElement.getBoundingClientRect();
          startX = rect.left - boundaryRect.left;
          startY = rect.top - boundaryRect.top;
        }

        const clampedPos = this.clampPosition({ x: newX, y: newY }, width, height);

        // Animation logic
        // Assign NEW object to trigger change detection
        drawnCard.pos = { x: startX, y: startY };
        drawnCard.faceUp = faceUp;
        // drawnCard.drawing = true; // Moved down to prevent animating from 0,0

        this.field.cards.push(drawnCard);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            drawnCard.drawing = true; // Enable transition
            // Assign NEW object for target
            drawnCard.pos = { x: clampedPos.x, y: clampedPos.y };

            setTimeout(() => {
              drawnCard.drawing = false;
            }, 300);
          });
        });
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
      // Reverted to bottom-right offset
      let newX = stack.pos.x + 50 + (Math.random() * 20 - 10);
      let newY = stack.pos.y + 50 + (Math.random() * 20 - 10);

      let width = GameSimulatorComponent.BASE_CARD_WIDTH * this.zoomLevel;
      let height = GameSimulatorComponent.BASE_CARD_HEIGHT * this.zoomLevel;

      const stackEl = document.getElementById(stack.uniqueId);
      let startX = stack.pos.x;
      let startY = stack.pos.y;

      if (stackEl && this.gameBoundary) {
        const rect = stackEl.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        const boundaryRect = this.gameBoundary.nativeElement.getBoundingClientRect();
        startX = rect.left - boundaryRect.left;
        startY = rect.top - boundaryRect.top;
      }

      const clampedPos = this.clampPosition({ x: newX, y: newY }, width, height);

      // Animation logic
      drawnCard.pos = { x: startX, y: startY };
      // drawnCard.drawing = true; // Moved to prevent animating from 0,0

      // Add the card to the field
      this.field.cards.push(drawnCard);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawnCard.drawing = true; // Enable transition
          drawnCard.pos = { x: clampedPos.x, y: clampedPos.y };

          setTimeout(() => {
            drawnCard.drawing = false;
          }, 300);
        });
      });
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
      card.discarding = true;
      card.faceUp = true; // Ensure face up while confirming discard

      // Animate to discard pile
      let width = GameSimulatorComponent.BASE_CARD_WIDTH * this.zoomLevel;
      let height = GameSimulatorComponent.BASE_CARD_HEIGHT * this.zoomLevel;
      const stackEl = document.getElementById(this.discard.uniqueId);
      if (stackEl) {
        width = stackEl.getBoundingClientRect().width;
        height = stackEl.getBoundingClientRect().height;
      }

      // Target position
      const targetPos = this.clampPosition(
        { x: this.discard.pos.x, y: this.discard.pos.y },
        width,
        height
      );

      // Apply position (CDK Drag will follow this if bound correctly, 
      // otherwise angular binding on [cdkDragFreeDragPosition] should update it)
      card.pos = targetPos;

      // Wait for animation
      setTimeout(() => {
        // Double check index in case it changed (unlikely in single threaded JS but good practice if async intervened)
        const idx = cards.indexOf(card);
        if (idx > -1) {
          cards.splice(idx, 1);
          card.discarding = false; // Reset state so it's interactable if drawn again
          this.discard.cards.push(card);
        }
      }, 500);
    }
  }

  public flipCard(card: GameCard) {
    if (card.flipping) return; // Prevent double trigger

    card.flipping = true;
    setTimeout(() => {
      card.faceUp = !card.faceUp;
    }, 200); // Half of animation duration

    setTimeout(() => {
      card.flipping = false;
    }, 400); // Full animation duration
  }

  public deleteItem(items: Positionable[], item: Positionable) {
    const index = items.indexOf(item);
    if (index > -1) {
      items.splice(index, 1);
    }
  }

  public async onStackContextMenu(event: MouseEvent, cm: ContextMenu, stack: CardStack) {
    event.preventDefault();
    const deckIds = stack.cards.map((card) => card.card.deckId)
      .filter((value, index, array) => array.indexOf(value) === index);
    const optionAttributes = await Promise.all(deckIds.map((deckId) => this.cardsService.getFieldsUnfiltered({ deckId: deckId })))
      .then((fieldArrays) => fieldArrays.flatMap((fieldArray) => fieldArray)
        .filter((field) => field.type == FieldType.dropdown && field.field !== 'frontCardTemplateId' && field.field !== 'backCardTemplateId'));

    this.contextMenuItems = [
      {
        label: this.translate.instant('simulator.draw-card'),
        icon: 'pi pi-plus',
        command: () => this.drawCard(stack),
        "disabled": stack.cards.length === 0
      },
      {
        label: this.translate.instant('simulator.rename-stack'),
        icon: 'pi pi-pencil',
        command: () => {
          this.stackToRename = stack;
          this.renameStackName = stack.name;
          this.renameDialogVisible = true;
        },
        disabled: stack === this.discard
      },
      {
        label: this.translate.instant('simulator.draw-card-facedown'),
        icon: 'pi pi-eye-slash',
        command: () => this.drawCard(stack, false),
        disabled: stack.cards.length === 0
      },
      {
        label: this.translate.instant('simulator.draw-specific-card'),
        icon: 'pi pi-id-card',
        disabled: stack.cards.length === 0,
        command: () => this.openDrawSpecificCardDialog(stack)
      },
      {
        label: this.translate.instant('simulator.shuffle-stack'),
        icon: 'pi pi-arrow-right-arrow-left',
        command: (event: any) => {
          stack.shuffling = true;
          setTimeout(() => {
            this.shuffleCards(stack.cards);
            stack.shuffling = false;
          }, 600);
        },
        disabled: stack.cards.length < 2
      },
      {
        label: this.translate.instant('simulator.flip-stack'),
        icon: 'pi pi-refresh',
        command: () => this.flipStack(stack),
        disabled: stack.cards.length === 0
      },
      {
        label: this.translate.instant('simulator.split-in-half'),
        icon: 'pi pi-clone',
        command: () => this.splitInHalf(stack),
        disabled: stack.cards.length < 2
      },
      {
        label: this.translate.instant('simulator.split-by-attribute'),
        icon: 'pi pi-clone',
        disabled: stack.cards.length === 0 || optionAttributes.length < 1,
        // Dynamically create a submenu for each card in the stack
        // items: stack.cards.map(gameCard => ({
        //   label: gameCard.card.name,
        //   command: () => this.drawSpecificCardFromStack(stack, gameCard)
        // })),
        items: optionAttributes.map(attribute => ({
          label: attribute.header,
          command: () => this.splitByAttribute(stack, attribute)
        }))
      },
      {
        label: this.translate.instant('simulator.delete'),
        icon: 'pi pi-trash',
        command: () => this.deleteItem(this.stacks, stack),
        disabled: !stack.deletable
      },
    ];
    cm.show(event);
  }

  public flipComponent(component: GameComponent) {
    if (component.flipping) return;

    component.flipping = true;
    setTimeout(() => {
      component.faceUp = !component.faceUp;
    }, 200);

    setTimeout(() => {
      component.flipping = false;
    }, 400);
  }

  public onCardContextMenu(event: MouseEvent, cm: ContextMenu, card: GameCard) {
    event.preventDefault();
    this.contextMenuItems = [
      {
        label: this.translate.instant('simulator.flip-card'),
        icon: 'pi pi-refresh',
        command: () => this.flipCard(card)
      },
      {
        label: this.translate.instant('simulator.create-stack'),
        icon: 'pi pi-book',
        command: () => this.createStack(this.field.cards, card)
      },
      {
        label: this.translate.instant('simulator.discard-card'),
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
        label: this.translate.instant('simulator.duplicate'),
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
        label: this.translate.instant('simulator.delete'),
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
        label: this.translate.instant('simulator.add-coin'),
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
                label: this.translate.instant('simulator.flip-randomly'),
                icon: 'pi pi-percentage',
                command: (event: any) => {
                  const componentState: GameComponent | undefined =
                    event.item?.state as GameComponent;
                  componentState.rolling = true;
                  setTimeout(() => {
                    // Also use flipComponent if desired, but rolling is distinct.
                    // Let's keep rolling as is for random, but if we want 3D flip for strict flip:
                    // Random flip implies "tossing". 
                    componentState.faceUp = Math.random() < 0.5;
                    componentState.rolling = false;
                  }, 600);
                }
              },
              {
                label: this.translate.instant('simulator.flip-over'),
                icon: 'pi pi-refresh',
                command: (event: any) => {
                  const componentState: GameComponent | undefined =
                    event.item?.state as GameComponent;
                  if (componentState) {
                    this.flipComponent(componentState);
                  }
                }
              },
            ];
            this.components.push(component);
          }
        }))
      },
      {
        label: this.translate.instant('simulator.add-cube'),
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
                  label: this.translate.instant('simulator.flip-over'),
                  icon: 'pi pi-refresh',
                  command: (event: any) => {
                    const componentState: GameComponent | undefined =
                      event.item?.state as GameComponent;
                    if (componentState) {
                      this.flipComponent(componentState);
                    }
                  }
                },
              ],
            };
            this.components.push(component);
          }
        }))
      },
      {
        label: this.translate.instant('simulator.add-die') + ' (D6)',
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
                  label: this.translate.instant('simulator.roll-die'),
                  icon: 'pi pi-percentage',
                  command: (event: any) => {
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
      {
        label: this.translate.instant('simulator.zoom'),
        icon: 'pi pi-search',
        items: [
          {
            label: '0.15x',
            command: () => { this.zoomLevel = 0.15; this.clampAllItems(); }
          },
          {
            label: '0.2x',
            command: () => { this.zoomLevel = 0.20; this.clampAllItems(); }
          },
          {
            label: '0.25x',
            command: () => { this.zoomLevel = 0.25; this.clampAllItems(); }
          },
          {
            label: '0.30x',
            command: () => { this.zoomLevel = 0.30; this.clampAllItems(); }
          },
          {
            label: '0.35x',
            command: () => { this.zoomLevel = 0.35; this.clampAllItems(); }
          }
        ]
      },
      {
        label: this.translate.instant('simulator.reset-game'),
        icon: 'pi pi-refresh',
        command: () => this.resetGame(),
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
      pos: {
        x: stack.pos.x + 50 + (Math.random() * 20 - 10),
        y: stack.pos.y + 50 + (Math.random() * 20 - 10)
      },
      deletable: true,
    });
  }

  public splitByAttribute(stack: CardStack, attribute: EntityField<Card>) {
    if (stack.cards.length < 2) {
      return;
    }
    const newStacks = attribute.options?.map((option) => ({
      uniqueId: StringUtils.generateRandomString(),
      name: stack.name + ' ' + option.value,
      cards: stack.cards.filter((card) => card.card[attribute.field] == option.value),
      faceUp: false,
      pos: {
        x: stack.pos.x + (Math.random() * 100 - 50),
        y: stack.pos.y + (Math.random() * 100 - 50)
      },
      deletable: true,
    } as CardStack)).filter((cardStack) => cardStack.cards.length > 0);

    // remove cards taken out of the main stack, and remove stack if empty and deletable
    stack.cards = stack.cards.filter((card) => !newStacks?.some((newStack) => newStack.cards.includes(card)));
    if (stack.cards.length < 1 && stack.deletable) {
      this.deleteItem(this.stacks, stack);
    }

    // add new stacks to the game
    newStacks?.forEach((stack) => this.stacks.push(stack));
  }

  public bringToFront(item: Positionable) {
    item.zIndex = ++this.topZIndex;
  }

  public onDragStarted(event: any, items: Positionable[], item: Positionable) {
    this.bringToFront(item);
    // send card to the end of the cards array
    const index = items.indexOf(item);
    if (index > -1) {
      items.splice(index, 1);
      items.push(item);
    }
    this.hoveredItem = undefined;

    // Check if we are dragging a stack
    if (items === this.stacks) {
      this.draggingStack = true;
    }
  }

  public onCardDragStarted(event: any, items: Positionable[], item: Positionable) {
    this.onDragStarted(event, items, item);
    this.draggingCard = true;
  }

  onDragEnded(event: CdkDragEnd<any>, items: Positionable[], item: Positionable) {
    const pos = event.source.getFreeDragPosition();
    item.pos = {
      x: pos.x,
      y: pos.y
    };

    if (this.draggingStack && this.hoveredItem && this.hoveredItem !== item) {
      const targetStack = this.hoveredItem as CardStack;
      const sourceStack = item as CardStack;

      // Move all cards from source to target
      targetStack.cards.push(...sourceStack.cards);

      // Check if source stack is the discard pile
      if (sourceStack === this.discard) {
        // Clear cards from discard
        sourceStack.cards = [];

        // Reposition discard pile near the target stack
        // Offset by a bit so it's visible "popped out"
        let newX = targetStack.pos.x + 120; // Offset to the right
        let newY = targetStack.pos.y + 20;

        // Get dimensions for clamping
        let width = GameSimulatorComponent.BASE_CARD_WIDTH * this.zoomLevel;
        let height = GameSimulatorComponent.BASE_CARD_HEIGHT * this.zoomLevel;

        const stackEl = document.getElementById(targetStack.uniqueId);
        if (stackEl) {
          const rect = stackEl.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
        }

        const clampedPos = this.clampPosition({ x: newX, y: newY }, width, height);
        sourceStack.pos = clampedPos;

      } else {
        // Remove source stack normally
        this.deleteItem(this.stacks, sourceStack);
      }

      this.hoveredItem = undefined;
    }

    this.draggingStack = false;
  }

  onCardDragEnded(event: CdkDragEnd<any>, cards: GameCard[], card: GameCard) {
    const pos = event.source.getFreeDragPosition();
    card.pos = {
      x: pos.x,
      y: pos.y
    };
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

  magnifiedCard: GameCard | undefined;
  magnifiedPos: Position = { x: 0, y: 0 };

  // ... (previous code)

  onCardMouseDown(event: MouseEvent, card: GameCard) {
    if (event.button == 1) {
      this.calculateMagnifiedPosition(event, card);
      this.magnifiedCard = card;
      event.preventDefault(); // Prevent default middle click scroll
    }
  }

  onCardMouseUp(event: MouseEvent, card: GameCard) {
    if (event.button == 1) {
      this.magnifiedCard = undefined;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent) {
    if (event.button == 1) {
      this.magnifiedCard = undefined;
    }
  }

  private clampAllItems() {
    const defaultCardWidth = GameSimulatorComponent.BASE_CARD_WIDTH * this.zoomLevel;
    const defaultCardHeight = GameSimulatorComponent.BASE_CARD_HEIGHT * this.zoomLevel;

    // Clamp Stacks
    this.stacks.forEach(stack => {
      let width = defaultCardWidth;
      let height = defaultCardHeight;
      const el = document.getElementById(stack.uniqueId);
      if (el) {
        width = el.getBoundingClientRect().width;
        height = el.getBoundingClientRect().height;
      }
      const newPos = this.clampPosition(stack.pos, width, height);
      stack.pos = { x: newPos.x, y: newPos.y };
    });

    // Clamp Cards
    this.field.cards.forEach(card => {
      let width = defaultCardWidth;
      let height = defaultCardHeight;
      const el = document.getElementById(card.uniqueId);
      if (el) {
        width = el.getBoundingClientRect().width;
        height = el.getBoundingClientRect().height;
      }
      const newPos = this.clampPosition(card.pos, width, height);
      card.pos = { x: newPos.x, y: newPos.y };
    });

    // Clamp Components (Dice/Coins)
    // Approximate size 50x50
    const componentSize = 50;
    this.components.forEach(comp => {
      let width = componentSize;
      let height = componentSize;
      const el = document.getElementById(comp.uniqueId);
      if (el) {
        width = el.getBoundingClientRect().width;
        height = el.getBoundingClientRect().height;
      }
      const newPos = this.clampPosition(comp.pos, width, height);
      comp.pos = { x: newPos.x, y: newPos.y };
    });
  }

  private clampPosition(pos: Position, itemWidth: number, itemHeight: number, padding: number = 16): Position {
    if (!this.gameBoundary) return pos;

    const boundaryRect = this.gameBoundary.nativeElement.getBoundingClientRect();
    // The items uses absolute positioning relative to the container.
    // So the max X is containerWidth - itemWidth
    // And max Y is containerHeight - itemHeight

    const maxX = boundaryRect.width - itemWidth - padding;
    const maxY = boundaryRect.height - itemHeight - padding;

    return {
      x: Math.max(padding, Math.min(maxX, pos.x)),
      y: Math.max(padding, Math.min(maxY, pos.y))
    };
  }

  private calculateMagnifiedPosition(event: MouseEvent, card: GameCard) {
    let width = 300; // Fallback
    let height = 420; // Fallback

    // Attempt to calculate actual target dimensions based on the source element
    const el = document.getElementById(card.uniqueId);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Calculate base dimensions (unscaled)
      const baseWidth = rect.width / this.zoomLevel;
      const baseHeight = rect.height / this.zoomLevel;

      // Calculate target dimensions
      width = baseWidth * this.zoomMagnifiedLevel;
      height = baseHeight * this.zoomMagnifiedLevel;
    }

    const padding = 20;

    let x = event.clientX;
    let y = event.clientY;

    // Clamp to window
    const minX = width / 2 + padding;
    const maxX = window.innerWidth - (width / 2) - padding;
    const minY = height / 2 + padding;
    const maxY = window.innerHeight - (height / 2) - padding;

    this.magnifiedPos.x = Math.max(minX, Math.min(maxX, x));
    this.magnifiedPos.y = Math.max(minY, Math.min(maxY, y));
  }

}
