import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const TCG_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner">
            <div class="tcg-header">{{card.name}}</div>
            <div class="tcg-art"></div>
            <div class="tcg-type">Ancient Brewer</div>
            <div class="tcg-description">
                The brewer is a very important card in the game. 
                It allows you to brew potions and create powerful effects.
            </div>
            <div class="tcg-footer">
                <span>Ciderians</span>
                <span>{{#padZeros card.id 3}}{{/padZeros}}</span>
            </div>
        </div>
    </div>
    `),
    css: StringUtils.dedent(`
    .card {
        width: {{cardSize.width}}px;
        height: {{cardSize.height}}px;
        padding: {{cardSize.padding}}px;
        background-color: hsl(0, 0%, 10%);
        color: hsl(0, 0%, 10%);
        font-size: 40px;
    }
    .inner {
        width: 100%;
        height: 100%;
        background-color: hsl(0, 0%, 60%);
        display: flex;
        flex-direction: column;
    }
    .tcg-header {
        font-size: 55px;
        padding: 5px;
        text-align: center;
    }
    .tcg-art {
        background-color: hsl(0, 0%, 30%);
        flex-basis: 50%;
    }
    .tcg-type {
        background-color: hsl(0, 0%, 50%);
        text-align: center;
        padding: 10px;
    }
    .tcg-description {
        flex: 1;
        padding-left: 25px;
        padding-right: 25px;
        padding-bottom: 10px;
    }
    .tcg-footer {
        padding: 15px 25px;
        display: flex;
        justify-content: space-between;
        font-size: 35px;
    }`)
} as CardTemplate;