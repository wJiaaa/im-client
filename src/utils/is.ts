/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:47:10
 */
// vue/prefer-import-from-vue
import { isArray, isObject } from '@vue/shared';

export const isUndefined = (val: any): val is undefined => val === undefined;
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isEmpty = (val: unknown) =>
  (!val && val !== 0) || (isArray(val) && val.length === 0) || (isObject(val) && !Object.keys(val).length);
