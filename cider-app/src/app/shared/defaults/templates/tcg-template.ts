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
        width: {{size.width}}px;
        height: {{size.height}}px;
        padding: {{size.padding}}px;
        background: {{theme.border}};
        color: {{theme.color}};
        font-size: 40px;
        // background: hsl(0, 0%, 10%);
        background: {{theme.background}};
    }
    .inner {
        width: 100%;
        height: 100%;
        // background: {{theme.background}};
        display: flex;
        flex-direction: column;
        background-size: cover;
        background-position: center;
    }
    .tcg-header {
        background: {{theme.banner}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        padding: 15px;
        text-align: center;
        font-size: 50px;
    }
    .tcg-art {
        background: {{theme.art}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        flex: 1;
    }
    .tcg-type {
        background: {{theme.bannerB}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        padding: 23px;
        text-align: center;
    }
    .tcg-description {
        background: {{theme.textbox}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        font-size: 35px;
        padding: 40px 50px;
        height: 230px;
    }
    .tcg-footer {
        padding: 15px 25px;
        padding-bottom: 0;
        display: flex;
        justify-content: space-between;
        font-size: 30px;
    }`)
} as CardTemplate;