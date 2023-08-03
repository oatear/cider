
    // TableStat
    //
    // field-name:
    //   token-name   token-count    token-copies-count
    //   token-name-2 token-count-2  token-copies-count-2
    //   ...
    // ...

    export interface TableStat {
        header: string;
        tokens: TokenStat[];
    }

    export interface TokenStat {
        token: string;
        count: number;
        copiesCount: number;
    }