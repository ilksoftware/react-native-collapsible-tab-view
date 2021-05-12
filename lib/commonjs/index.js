"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Container", {
  enumerable: true,
  get: function () {
    return _Container.Container;
  }
});
Object.defineProperty(exports, "FlatList", {
  enumerable: true,
  get: function () {
    return _FlatList.FlatList;
  }
});
Object.defineProperty(exports, "Lazy", {
  enumerable: true,
  get: function () {
    return _Lazy.Lazy;
  }
});
Object.defineProperty(exports, "ScrollView", {
  enumerable: true,
  get: function () {
    return _ScrollView.ScrollView;
  }
});
Object.defineProperty(exports, "Tab", {
  enumerable: true,
  get: function () {
    return _Tab.Tab;
  }
});
Object.defineProperty(exports, "useHeaderMeasurements", {
  enumerable: true,
  get: function () {
    return _hooks.useHeaderMeasurements;
  }
});
Object.defineProperty(exports, "useFocusedTab", {
  enumerable: true,
  get: function () {
    return _hooks.useFocusedTab;
  }
});
Object.defineProperty(exports, "useAnimatedTabIndex", {
  enumerable: true,
  get: function () {
    return _hooks.useAnimatedTabIndex;
  }
});
Object.defineProperty(exports, "useCollapsibleStyle", {
  enumerable: true,
  get: function () {
    return _hooks.useCollapsibleStyle;
  }
});
Object.defineProperty(exports, "MaterialTabBar", {
  enumerable: true,
  get: function () {
    return _TabBar.MaterialTabBar;
  }
});
Object.defineProperty(exports, "MaterialTabItem", {
  enumerable: true,
  get: function () {
    return _TabItem.MaterialTabItem;
  }
});
exports.Tabs = void 0;

var _Container = require("./Container");

var _FlatList = require("./FlatList");

var _Lazy = require("./Lazy");

var _ScrollView = require("./ScrollView");

var _Tab = require("./Tab");

var _hooks = require("./hooks");

var _TabBar = require("./MaterialTabBar/TabBar");

var _TabItem = require("./MaterialTabBar/TabItem");

const Tabs = {
  Container: _Container.Container,
  Tab: _Tab.Tab,
  Lazy: _Lazy.Lazy,
  FlatList: _FlatList.FlatList,
  ScrollView: _ScrollView.ScrollView
};
exports.Tabs = Tabs;
//# sourceMappingURL=index.js.map