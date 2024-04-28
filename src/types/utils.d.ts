/*
 * @Description: 类型工具
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-06-17 14:11:07
 */

/**
 * 将类型 T 转换为可为 null 的类型
 * @template T - 原始类型
 */
type Nullable<T> = T | null;

/**
 * 提取对象的属性值为联合类型
 * @template T - 对象类型
 */
type ValuesOf<T> = T[keyof T];

type Emptyable<T> = T | {};
