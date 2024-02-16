export interface Variable {
    id: number;
    name: string;
    value: string;
}

export type VariableCollection = { [name: string]: string; };