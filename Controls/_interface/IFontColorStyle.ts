export interface IFontColorStyleOptions {
   fontColorStyle?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные цвета текста.
 *
 * @interface Controls/_interface/IFontColorStyle
 * @public
 */

/*
 * Interface for control, which has different font colors
 *
 * @interface Controls/_interface/IFontColorStyle
 * @public
 */
export default interface IFontColorStyle {
   readonly '[Controls/_interface/IFontColorStyle]': boolean;
}
/**
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {Enum} Стиль цвета текста контрола.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant unaccented
 * @variant link
 * @variant label
 * @variant default
 * @demo Controls-demo/Buttons/FontStyles/Index
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @example
 * Кнопка со стилем шрифта по умолчанию.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Кнопка со стилем шрифта "success".
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontColorStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IFontColorStyle#fontColorStyle
 * @cfg {Enum} Font color style value.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant unaccented
 * @variant link
 * @variant label
 * @variant default
 * @example
 * Button with default font style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Button with success font style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontColorStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */
