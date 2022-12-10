import { FieldType } from "./field-type.type";

export interface CardAttribute {
    id: number;
    deckId: number;
    name: string;
    type: FieldType;
    description: string;
    options: string[];
}
