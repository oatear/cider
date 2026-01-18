import { Action } from 'rxjs/internal/scheduler/Action';
import { Card } from '../data-services/types/card.type';
import { MenuItem } from 'primeng/api';

export interface CardZone {
    name: string;
    cards: GameCard[];
}

export interface CardStack extends Positionable {
    uniqueId: string;
    name: string;
    cards: GameCard[];
    faceUp: boolean;
    deletable: boolean;
    shuffling?: boolean;
    flipping?: boolean;
    rotation?: number;
}

export interface GameCard extends Positionable {
    uniqueId: string;
    card: Card;
    faceUp: boolean;
    matchId?: string;
    discarding?: boolean;
    drawing?: boolean;
    flipping?: boolean;
    rotation?: number;
    holographic?: boolean;
}

export interface GameComponent extends Positionable {
    uniqueId: string;
    type: 'coin' | 'cube' | 'd6';
    className: string;
    faceUp: boolean;
    face?: number;
    rolling?: boolean;
    flipping?: boolean;
    contextMenu: MenuItem[];
}

export interface Positionable {
    pos: Position;
    zIndex?: number;
}

export interface Position {
    x: number;
    y: number;
}
