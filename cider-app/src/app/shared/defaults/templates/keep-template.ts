import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const KEEP_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner">
            <div class="header">{{card.name}}</div>
            <div class="badge">5</div>
            <div class="art"></div>
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
        color: {{theme.color}};
        padding: 15px;
        text-align: center;
        font-size: 50px;
    }
    .badge {
        position: absolute;
        background: {{theme.badge}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        width: 128px;
        height: 128px;
        top: 20px;
        left: 25px;
        text-align: center;
        line-height: 128px;
        font-size: 60px;
    }
    .art {
        background: {{theme.art}};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        flex: 1;
    }
    .footer {
        padding: 15px 25px;
        padding-bottom: 0;
        display: flex;
        justify-content: space-between;
        font-size: 30px;
    }`)
} as CardTemplate;