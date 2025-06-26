import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const RESOURCE_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner">
            <div class="trick-taking-header">
                <span class="trick-taking-rank">3</span>
                <span class="trick-taking-suit">♣</span>
            </div>
            <div class="trick-taking-name">{{card.name}}</div>
            <div class="trick-taking-art">♣</div>
            <div class="trick-taking-description">{{card.description}}</div>
            <div class="trick-taking-footer">
                <span class="trick-taking-rank">3</span>
                <span class="trick-taking-suit">♣</span>
            </div>
        </div>
    </div>`),
    css:StringUtils.dedent(`
    .card {
        width: {{cardSize.width}}px;
        height: {{cardSize.height}}px;
        padding: {{cardSize.padding}}px;
        background-color: hsl(0, 0%, 80%);
        color: hsl(0, 0%, 10%);
        font-size: 40px;
    }
    .inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .trick-taking-header {
        display: flex;
        flex-direction: column;
        padding: 35px;
        font-size: 80px;
    }
    .trick-taking-footer {
        display: flex;
        flex-direction: column;
        padding: 35px;
        font-size: 80px;
        transform: scale(-1);
    }
    .trick-taking-art {
        flex: 1;
        font-size: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .trick-taking-name {
        font-size: 60px;
        padding: 5px;
        text-align: center;
    }
    .trick-taking-description {
        padding: 35px;
    }
    `)
} as CardTemplate;