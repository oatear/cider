import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const CARD_BACK_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner"></div>
    </div>`),
    css: StringUtils.dedent(`.card {
        width: {{cardSize.width}}px;
        height: {{cardSize.height}}px;
        padding: {{cardSize.padding}}px;
        background-color: hsl(0, 0%, 70%);
    }
    .inner {
        width: 100%;
        height: 100%;
        background-color: hsl(0, 0%, 50%);
    }`)
} as CardTemplate;