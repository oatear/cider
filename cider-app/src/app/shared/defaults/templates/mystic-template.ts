import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const MYSTIC_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner">
            <div class="header">
                <span>{{card.name}}</span>
                <span>
                    <span class="cost-symbol"></span>
                    <span class="cost-symbol"></span>
                    <span class="cost-symbol"></span>
                </span>
            </div>
            <div class="art"></div>
            <div class="type">
                <span>Ancient Brewer {{card.magicks}}</span>
                <span>
                    <span class="type-symbol"></span>
                </span>
            </div>
            <div class="description">
                The brewer is a very important card in the game. 
                It allows you to brew potions and create powerful effects.
            </div>
            <div class="stats">2/2</div>
            <div class="footer">
                <span>Ciderians</span>
                <span>{{#padZeros card.id 3}}{{/padZeros}}</span>
            </div>
        </div>
    </div>
    `),
    css: StringUtils.dedent(`
    .card {
        width: {{size.width}}px;
        height: {{size.height}}px;
        padding: {{size.padding}}px;
        padding-bottom: 25px;
        font-size: 40px;
        background: {{theme.background}};
        color: {{theme.color}};
    }
    .inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-size: cover;
        background-position: center;
    }
    .header {
        background: {{theme.banner}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        font-size: 50px;
        padding: 14px 30px;
        display: flex;
        justify-content: space-between;
        color: {{theme.color}};
    }
    .art {
        background: {{theme.art}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        flex: 1;
        border: 4px solid {{theme.outline}};
        border-radius: 20px;
        margin: 5px 10px;
    }
    .type {
        background: {{theme.banner}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        text-align: center;
        padding: 23px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .type-symbol {
        background: {{theme.symbol}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        width: 64px;
        height: 64px;
        display: inline-block;
        margin: 0;
        margin-bottom: -10px;
    }
    .cost-symbol {
        background: {{theme.symbol}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        width: 64px;
        height: 64px;
        display: inline-block;
        margin: 0;
        margin-bottom: -10px;
    }
    .description {
        background: {{theme.textbox}};
        background-size: contain;
        background-position: center;
        color: black;
        font-size: 35px;
        padding-bottom: 10px;
        padding: 40px 50px;
        height: 300px;
    }
    .stats {
        background-color: hsl(0, 0%, 50%);
        background: {{theme.smallBanner}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        text-align: center;
        position: absolute;
        padding: 23px 30px;
        top: 1000px;
        left: 620px;
        width: 150px;
    }
    .footer {
        padding: 15px 25px;
        padding-bottom: 0;
        display: flex;
        font-size: 30px;
        gap: 10px;
    }`)
} as CardTemplate;