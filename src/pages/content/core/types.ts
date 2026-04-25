export type InsertPositionType = 'afterend' | 'beforeend' | 'afterbegin' | 'beforebegin';

export interface PriceTargetConfig {
  selector: string;
  insertPosition?: InsertPositionType;
  color?: string;
  backgroundColor?: string;
  customStyle?: Partial<CSSStyleDeclaration>;
}
