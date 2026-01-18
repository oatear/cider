import { Injectable } from '@angular/core';
import { CardStack, CardZone, GameCard, GameComponent, Position } from './game-simulator.types';
import { DecksService } from '../data-services/services/decks.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';
import StringUtils from '../shared/utils/string-utils';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GameSimulatorStateService {

    public stacks: CardStack[] = [];
    public field: CardZone = { name: 'Field', cards: [] };
    public components: GameComponent[] = [];
    public zoomLevel: number = 0.20;
    public discard: CardStack = {
        name: 'Discard', cards: [], faceUp: true,
        uniqueId: 'discard-pile', // Fixed ID for discard? Or random? Component used random. Let's stick to component logic or init.
        pos: { x: 0, y: 0 },
        deletable: false
    };

    private _initialized = false;
    get initialized() { return this._initialized; }

    constructor(
        private decksService: DecksService,
        private cardsService: CardsService
    ) {
        // Initialize default discard if needed, though resetGame will overwrite
        this.discard.uniqueId = StringUtils.generateRandomString();
    }

    public async resetGame() {
        const stacks: CardStack[] = [];
        const decks = await this.decksService.getAll();

        // Process decks sequentially or promise.all. Component used forEach/then which is a bit mixy.
        // Let's use clean async/await
        let deckIndex = 0;
        for (const deck of decks) {
            const cards = await this.cardsService.getAll({ deckId: deck.id });
            const expandedCards: GameCard[] = [];

            cards.forEach(card => {
                for (let i = 0; i < card.count; i++) {
                    expandedCards.push({
                        uniqueId: StringUtils.generateRandomString(),
                        card: card,
                        faceUp: true,
                        pos: { x: 0, y: 0 }
                    } as GameCard);
                }
            });

            this.shuffleCards(expandedCards);

            const dropPos: Position = {
                x: (deckIndex % 4) * 200,
                y: Math.floor(deckIndex / 4) * 300
            };

            stacks.push({
                uniqueId: StringUtils.generateRandomString(),
                name: deck.name,
                cards: expandedCards,
                faceUp: false,
                pos: dropPos,
                deletable: true,
                rotation: 0
            });

            deckIndex++;
        }

        // Setup Discard
        this.discard = {
            name: 'Discard',
            cards: [],
            uniqueId: StringUtils.generateRandomString(),
            faceUp: true,
            pos: { x: 800, y: 0 },
            deletable: false,
        };
        stacks.push(this.discard);

        // Apply state
        this.stacks = stacks;
        this.field = { name: 'Field', cards: [] };
        this.components = []; // Or keep components on reset? Usually reset clears everything.

        this._initialized = true;
    }

    public async updateGameState() {
        if (!this._initialized) {
            return this.resetGame();
        }

        // 1. Fetch all current Decks and Cards
        const decks = await this.decksService.getAll();
        const allDeckIds = new Set(decks.map(d => d.id));

        const allCards: Card[] = [];
        for (const deck of decks) {
            const deckCards = await this.cardsService.getAll({ deckId: deck.id });
            allCards.push(...deckCards);
        }
        const cardMap = new Map(allCards.map(c => [c.id, c]));

        // 2. Update existing GameCards in Stacks, Field, Discard
        const allGameCards = [
            ...this.stacks.flatMap(s => s.cards),
            ...this.field.cards,
            // Discard is in stacks? Component logic put discard in stored stacks list.
            // If discard is separate property but also in stacks array, we need to be careful not to duplicate.
            // In this service implementation I kept them separate properties but component pushed discard to stacks. 
            // Let's ensure consistency: in resetGame I pushed discard to stacks.
            // So checking this.stacks covers discard if it's in there.
        ];

        // Check if discard is in stacks, if not add its cards to check list (though it should be in stacks)
        if (!this.stacks.find(s => s === this.discard)) {
            allGameCards.push(...this.discard.cards);
        }

        const gameCardsToRemove: GameCard[] = [];
        const countInSimulator = new Map<number, number>(); // cardId -> count

        for (const gameCard of allGameCards) {
            const latestCard = cardMap.get(gameCard.card.id);
            if (!latestCard) {
                // Card deleted from project
                gameCardsToRemove.push(gameCard);
            } else {
                // Update data
                gameCard.card = latestCard;
                countInSimulator.set(latestCard.id, (countInSimulator.get(latestCard.id) || 0) + 1);
            }
        }

        // Remove deleted cards
        this.removeGameCards(gameCardsToRemove);

        // 3. Add Missing Cards (Cards present in project but 0 instances in simulator)
        const cardsToAdd: Card[] = [];
        for (const card of allCards) {
            if (!countInSimulator.has(card.id) && card.count > 0) {
                cardsToAdd.push(card);
            }
        }

        if (cardsToAdd.length > 0) {
            this.addNewCardsStack(cardsToAdd);
        }
    }

    private removeGameCards(cardsToRemove: GameCard[]) {
        const set = new Set(cardsToRemove);

        // Remove from Stacks
        this.stacks.forEach(stack => {
            stack.cards = stack.cards.filter(c => !set.has(c));
        });
        // Remove from Field
        this.field.cards = this.field.cards.filter(c => !set.has(c));

        // Remove from Discard if not in stacks
        if (!this.stacks.includes(this.discard)) {
            this.discard.cards = this.discard.cards.filter(c => !set.has(c));
        }
    }

    private addNewCardsStack(cards: Card[]) {
        const newGameCards: GameCard[] = [];
        cards.forEach(card => {
            // Add 'count' number of instances? 
            // Requirement: "Create new instances for cards that have zero representation... Add to new cards stack"
            // "If a card exists ... but count changed ... do NOT automatically add/remove"
            // Implies if 0 exist, we probably want to respect the 'count' property for the initial add? 
            // "create new instances for cards that have zero representation" -> likely defaults to 'count' since it's a fresh add.
            for (let i = 0; i < card.count; i++) {
                newGameCards.push({
                    uniqueId: StringUtils.generateRandomString(),
                    card: card,
                    faceUp: true,
                    pos: { x: 0, y: 0 }
                });
            }
        });

        if (newGameCards.length === 0) return;

        this.shuffleCards(newGameCards);

        this.stacks.push({
            uniqueId: StringUtils.generateRandomString(),
            name: 'New Cards',
            cards: newGameCards,
            faceUp: false,
            pos: { x: 50, y: 50 }, // Top left
            deletable: true,
            rotation: 0
        });
    }

    public shuffleCards(cards: GameCard[]) {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }
}
