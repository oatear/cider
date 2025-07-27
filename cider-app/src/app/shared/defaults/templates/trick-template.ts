import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const TRICK_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner">
            <div class="header">
                <div class="suit-stack">
                    <div class="rank">3</div>
                    <div class="suit"></div>
                </div>
                <div class="name-stack">
                    <div class="name">{{card.name}}</div>
                    <div class="description">The brewer is a very important card in the game. It allows you to brew potions and create powerful effects..</div>
                </div>
            </div>
            <div class="art"></div>
            <div class="footer">
                <div class="suit-stack">
                    <div class="rank">3</div>
                    <div class="suit"></div>
                </div>
                <div class="name-stack">
                    <div class="name">{{card.name}}</div>
                    <div class="description">The brewer is a very important card in the game. It allows you to brew potions and create powerful effects..</div>
                </div>
            </div>
        </div>
    </div>
    `),
    css:StringUtils.dedent(`
    .card {
        width: {{size.width}}px;
        height: {{size.height}}px;
        padding: {{size.padding}}px;
        font-size: 40px;
        background: {{theme.background}};
        color: {{theme.color}};
    }
    .inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .header {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }
    .suit-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 80px;
    }
    .suit {
        background: {{theme.symbol}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        width: 100px;
        height: 100px;
        display: inline-block;
        margin: 0;
        margin-bottom: -10px;
    }
    .name-stack {
        display: flex;
        flex-direction: column;
        background: {{theme.textbox}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        /* font-size: 50px; */
        padding: 30px 50px;
        width: 100%;
    }
    .name {
        text-transform: uppercase;
        font-size: 50px;
        padding: 5px;
        text-align: center;
    }
    .footer {
        display: flex;
        flex-direction: row;
        gap: 20px;
        transform: scale(-1);
    }
    .art {
        flex: 1;
        font-size: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: {{theme.art}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    }
    .description {
        font-size: 30px;
    }
    `)
} as CardTemplate;