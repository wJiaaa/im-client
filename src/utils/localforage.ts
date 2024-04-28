import localforage from 'localforage';
// 配置 LocalForage
localforage.config({
  driver: localforage.INDEXEDDB, // 选择存储引擎，可以是 INDEXEDDB、WEBSQL、LOCALSTORAGE
  name: 'iM' // 数据库的名称
});
export default localforage;
