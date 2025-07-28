import { CardTemplate } from "src/app/data-services/types/card-template.type";
import StringUtils from "../../utils/string-utils";

export const CARD_BACK_TEMPLATE: CardTemplate = {
    html: StringUtils.dedent(`
    <div class="card">
        <div class="inner"></div>
    </div>`),
    css: StringUtils.dedent(`.card {
        width: {{size.width}}px;
        height: {{size.height}}px;
        padding: {{size.padding}}px;
        background: {{theme.front}};
    }
    .inner {
        width: 100%;
        height: 100%;
        background: {{theme.background}};
        background: {{theme.art}};
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 4px solid {{theme.outline}};
        border-radius: 30px;
    }`)
} as CardTemplate;